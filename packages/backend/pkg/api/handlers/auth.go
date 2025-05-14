package handler

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/jinzhu/copier"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/db"
	clog "github.com/marcotheo/genesis-link/packages/backend/pkg/logger"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/services"
)

type AuthHandler struct {
	dataService    *services.DataService
	cognitoService *services.CognitoService
	utilService    *services.UtilService
	isLocalHost    bool
	domain         string
}

func InitAuthHandler(dataService *services.DataService, cognitoService *services.CognitoService, utilService *services.UtilService) *AuthHandler {
	domain := os.Getenv("DOMAIN")
	isLocalHost := domain == "localhost" || domain == ""

	// Only prepend "." if not localhost
	if !isLocalHost {
		domain = "." + domain
	}

	return &AuthHandler{
		dataService:    dataService,
		cognitoService: cognitoService,
		utilService:    utilService,
		isLocalHost:    isLocalHost,
		domain:         domain,
	}
}

type CreateUserParamsValidation struct {
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required"`
	FirstName string `json:"firstName" validate:"required"`
	LastName  string `json:"lastName" validate:"required"`
}

func (h *AuthHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(AUTH) CreateUser => invoked")

	var userValidation CreateUserParamsValidation

	errRead := ReadAndValidateBody(r, &userValidation)
	if errRead != nil {
		http.Error(w, errRead.Error(), http.StatusBadRequest)
		return
	}

	// create user in cognito user pool
	userId, err := h.cognitoService.SignUpUser(userValidation.Email, userValidation.Password)
	if err != nil {
		clog.Logger.Error(fmt.Sprintf("(AUTH) CreateUser => Error signing up user in cognito: %s", err))
		errorResponse(w, http.StatusInternalServerError, "Something Went Wrong")
		return
	}

	// pass to validated data to actual db params
	var userData db.CreateUserParams
	errCopier := copier.Copy(&userData, &userValidation)
	if errCopier != nil {
		clog.Logger.Error(fmt.Sprintf("(AUTH) CreateUser => Error copying: %s", errCopier))
		errorResponse(w, http.StatusInternalServerError, "Something Went Wrong")
		return
	}

	userData.Userid = userId

	user, errQ := h.dataService.Queries.CreateUser(context.Background(), userData)
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(AUTH) CreateUser => errQ %s \n", errQ))
		http.Error(w, "failed to create user", http.StatusInternalServerError)
		return
	}

	clog.Logger.Success("(AUTH) CreateUser => create successful")

	successResponse(w, user)
}

type ConfirmSignUpParamsValidation struct {
	Username string `json:"username" validate:"required"`
	Code     string `json:"code" validate:"required"`
}

type ConfirmSignUpResponse struct {
	Confirmed bool
}

func (h *AuthHandler) ConfirmSignUp(w http.ResponseWriter, r *http.Request) {
	var inputValidation ConfirmSignUpParamsValidation

	errRead := ReadAndValidateBody(r, &inputValidation)
	if errRead != nil {
		errorResponse(w, http.StatusBadRequest, errRead.Error())
		return
	}

	isConfirmed, err := h.cognitoService.ConfirmUser(inputValidation.Username, inputValidation.Code)
	if err != nil {
		errMessage := err.Error()

		if strings.Contains(errMessage, "CodeMismatchException") {
			errorResponse(w, http.StatusBadRequest, "Invalid Code")
		} else if strings.Contains(errMessage, "UserNotFoundException") {
			errorResponse(w, http.StatusBadRequest, "User not found")
		} else if strings.Contains(errMessage, "LimitExceededException") {
			errorResponse(w, http.StatusBadRequest, "Verification Attempts Exceeded")
		} else {
			errorResponse(w, http.StatusInternalServerError, "Something Went Wrong!")
		}

		return
	}

	successResponse(w, ConfirmSignUpResponse{Confirmed: isConfirmed})
}

type SignInUserParamsValidation struct {
	Email    string `json:"email" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type SignInUserResponse struct {
	ExpiresIn int32
}

// Generates a random CSRF token
func generateCSRFToken() (string, error) {
	token := make([]byte, 32)
	_, err := rand.Read(token)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(token), nil
}

// Helper to build a cookie with optional domain
func builderCookie(name, value string, expires time.Time, httpOnly bool, secure bool, isLocalHost bool, domain string) *http.Cookie {
	cookie := &http.Cookie{
		Name:     name,
		Value:    value,
		Expires:  expires,
		HttpOnly: httpOnly,
		SameSite: http.SameSiteLaxMode,
		Secure:   secure,
		Path:     "/",
	}
	if !isLocalHost {
		cookie.Domain = domain
	}
	return cookie
}

func (h *AuthHandler) SignInUser(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(AUTH) SignInUser => invoked")

	var inputValidation SignInUserParamsValidation

	errRead := ReadAndValidateBody(r, &inputValidation)
	if errRead != nil {
		errorResponse(w, http.StatusBadRequest, errRead.Error())
		return
	}

	res, err := h.cognitoService.SignInUser(inputValidation.Email, inputValidation.Password)
	if err != nil {
		clog.Logger.Error(fmt.Sprintf("error signin %s \n", err))
		errorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	csrfToken, err := generateCSRFToken()
	if err != nil {
		errorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	secure := r.TLS != nil
	expiresIn := time.Now().Unix() + int64(res.ExpiresIn)

	// check from api gateway headers
	if r.Header.Get("X-Forwarded-Proto") == "https" && !h.isLocalHost {
		secure = true
	}

	csrfTokenCookie := builderCookie("csrfToken", csrfToken, time.Now().Add(3*time.Hour), false, secure, h.isLocalHost, h.domain)
	accessTokenCookie := builderCookie("accessToken", *res.AccessToken, time.Now().Add(10*time.Minute), true, secure, h.isLocalHost, h.domain)
	refreshTokenCookie := builderCookie("refreshToken", *res.RefreshToken, time.Now().Add(3*time.Hour), true, secure, h.isLocalHost, h.domain)
	expiresInCookie := builderCookie("tokenExpiresIn", strconv.FormatInt(expiresIn, 10), time.Now().Add(3*time.Hour), false, secure, h.isLocalHost, h.domain)

	http.SetCookie(w, csrfTokenCookie)
	http.SetCookie(w, refreshTokenCookie)
	http.SetCookie(w, accessTokenCookie)
	http.SetCookie(w, expiresInCookie)

	clog.Logger.Success("(AUTH) SignInUser => success")

	successResponse(w, SignInUserResponse{ExpiresIn: res.ExpiresIn})
}

type GoogleSignInCodeParams struct {
	Code string `json:"code" validate:"required"`
}

func (h *AuthHandler) ExternalProviderSignIn(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(AUTH) ExternalProviderSignIn => invoked")

	genericErrMessage := "Something went wrong while signing you in. Please try again"
	var params GoogleSignInCodeParams

	err := ReadAndValidateBody(r, &params)
	if err != nil {
		clog.Logger.Error("(AUTH) ExternalProviderSignIn => Missing authorization code")
		errorResponse(w, http.StatusBadRequest, "Missing authorization code")
		return
	}

	res, err := h.cognitoService.GoogleExchangeAuthCode(params.Code)
	if err != nil {
		if errors.Is(err, services.ErrCognitoInvalidAuthCode) {
			clog.Logger.Error(fmt.Sprintf("(AUTH) ExternalProviderSignIn => Invalid or expired authorization code: %s", err))
			errorResponse(w, http.StatusBadRequest, "Invalid or expired authorization code.")
			return
		}

		clog.Logger.Error(fmt.Sprintf("(AUTH) ExternalProviderSignIn => failed to get user details: %s", err))
		errorResponse(w, http.StatusInternalServerError, genericErrMessage)
		return
	}

	userAttributes, err := h.cognitoService.ParseIDToken(res.IDToken)
	if err != nil {
		clog.Logger.Error(fmt.Sprintf("(AUTH) ExternalProviderSignIn => failed to get user details: %s", err))
		errorResponse(w, http.StatusInternalServerError, genericErrMessage)
		return
	}

	_, err = h.dataService.Queries.GetUser(context.Background(), userAttributes.Sub)
	if err != nil {
		if strings.Contains(err.Error(), "no rows in result set") {
			_, errQ := h.dataService.Queries.CreateUser(context.Background(), db.CreateUserParams{
				Userid:    userAttributes.Sub,
				Firstname: userAttributes.GivenName,
				Lastname:  userAttributes.FamilyName,
				Email:     userAttributes.Email,
			})

			if errQ != nil {
				clog.Logger.Error(fmt.Sprintf("(AUTH) ExternalProviderSignIn => User authenticated via Cognito but failed to create local user record %s \n", errQ))
				http.Error(w, "Sign-in was successful, but account setup failed. Please try again.", http.StatusInternalServerError)
				return
			}
		} else {
			clog.Logger.Error(fmt.Sprintf("(AUTH) ExternalProviderSignIn => error in query GetUser = (%s) \n", err))
			errorResponse(w, http.StatusInternalServerError, genericErrMessage)
			return
		}
	}

	csrfToken, err := generateCSRFToken()
	if err != nil {
		errorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	secure := r.TLS != nil
	expiresIn := time.Now().Unix() + int64(res.ExpiresIn)

	// check from api gateway headers
	if r.Header.Get("X-Forwarded-Proto") == "https" && !h.isLocalHost {
		secure = true
	}

	csrfTokenCookie := builderCookie("csrfToken", csrfToken, time.Now().Add(3*time.Hour), false, secure, h.isLocalHost, h.domain)
	accessTokenCookie := builderCookie("accessToken", res.AccessToken, time.Now().Add(10*time.Minute), true, secure, h.isLocalHost, h.domain)
	refreshTokenCookie := builderCookie("refreshToken", res.RefreshToken, time.Now().Add(3*time.Hour), true, secure, h.isLocalHost, h.domain)
	expiresInCookie := builderCookie("tokenExpiresIn", strconv.FormatInt(expiresIn, 10), time.Now().Add(3*time.Hour), false, secure, h.isLocalHost, h.domain)

	http.SetCookie(w, csrfTokenCookie)
	http.SetCookie(w, refreshTokenCookie)
	http.SetCookie(w, accessTokenCookie)
	http.SetCookie(w, expiresInCookie)

	clog.Logger.Success("(AUTH) ExternalProviderSignIn => success")

	successResponse(w, SignInUserResponse{ExpiresIn: int32(res.ExpiresIn)})
}

func (h *AuthHandler) RefreshAccessToken(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(AUTH) RefreshAccessToken => invoked")

	refreshToken, errorRefreshToken := r.Cookie("refreshToken")
	if errorRefreshToken != nil {
		if errorRefreshToken == http.ErrNoCookie {
			errorResponse(w, http.StatusUnauthorized, "Session Invalid")
			return
		}
		errorResponse(w, http.StatusBadRequest, "Session Invalid")
		return
	}

	accessToken, errorAccessToken := r.Cookie("accessToken")
	if errorAccessToken != nil {
		if errorAccessToken == http.ErrNoCookie {
			errorResponse(w, http.StatusUnauthorized, "Session Invalid")
			return
		}
		errorResponse(w, http.StatusBadRequest, "Session Invalid")
		return
	}

	userId, errUserId := h.cognitoService.GetUserId(accessToken.Value)
	if errUserId != nil {
		errorResponse(w, http.StatusBadRequest, "Session Invalid")
		return
	}

	res, err := h.cognitoService.RefreshAccessToken(userId, refreshToken.Value)
	if err != nil {
		errorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	clog.Logger.Info("(AUTH) RefreshAccessToken => success")

	secure := r.TLS != nil
	expiresIn := time.Now().Unix() + int64(res.ExpiresIn)

	// check from api gateway headers
	if r.Header.Get("X-Forwarded-Proto") == "https" && !h.isLocalHost {
		secure = true
	}

	accessTokenCookie := builderCookie("accessToken", *res.AccessToken, time.Now().Add(10*time.Minute), true, secure, h.isLocalHost, h.domain)
	expiresInCookie := builderCookie("tokenExpiresIn", strconv.FormatInt(expiresIn, 10), time.Now().Add(3*time.Hour), false, secure, h.isLocalHost, h.domain)

	http.SetCookie(w, accessTokenCookie)
	http.SetCookie(w, expiresInCookie)

	successResponse(w, SignInUserResponse{ExpiresIn: res.ExpiresIn})
}

func (h *AuthHandler) RevokeRefreshToken(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(AUTH) RevokeRefreshToken => invoked")

	refreshToken, errorRefreshToken := r.Cookie("refreshToken")
	if errorRefreshToken != nil {
		if errorRefreshToken == http.ErrNoCookie {
			errorResponse(w, http.StatusUnauthorized, "No refresh token found")
			return
		}
		errorResponse(w, http.StatusBadRequest, "Error reading cookie")
		return
	}

	err := h.cognitoService.RevokeToken(refreshToken.Value)
	if err != nil {
		errorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	clog.Logger.Info("(AUTH) RevokeRefreshToken => success")

	secure := r.TLS != nil
	domain := "." + os.Getenv("DOMAIN")

	if domain == "." {
		domain = "localhost"
	}

	// check from api gateway headers
	if r.Header.Get("X-Forwarded-Proto") == "https" {
		secure = true
	}

	csrfTokenCookie := &http.Cookie{
		Name:     "csrfToken",
		Value:    "",
		Expires:  time.Now(),
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   secure,
		Domain:   domain,
		Path:     "/",
	}

	accessTokenCookie := &http.Cookie{
		Name:     "accessToken",
		Value:    "",
		Expires:  time.Now(),
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   secure,
		Domain:   domain,
		Path:     "/",
	}

	refreshTokenCookie := &http.Cookie{
		Name:     "refreshToken",
		Value:    "",
		Expires:  time.Now(),
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   secure,
		Domain:   domain,
		Path:     "/",
	}

	expiresInCookie := &http.Cookie{
		Name:     "tokenExpiresIn",
		Value:    "",
		Expires:  time.Now(),
		HttpOnly: false,
		SameSite: http.SameSiteLaxMode,
		Secure:   secure,
		Domain:   domain,
		Path:     "/",
	}

	http.SetCookie(w, csrfTokenCookie)
	http.SetCookie(w, refreshTokenCookie)
	http.SetCookie(w, accessTokenCookie)
	http.SetCookie(w, expiresInCookie)

	successResponse(w, true)
}
