package handler

import (
	"context"
	"crypto/rand"
	"encoding/base64"
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
}

func InitAuthHandler(dataService *services.DataService, cognitoService *services.CognitoService, utilService *services.UtilService) *AuthHandler {
	return &AuthHandler{
		dataService:    dataService,
		cognitoService: cognitoService,
		utilService:    utilService,
	}
}

type CreateUserParamsValidation struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
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
		http.Error(w, "Error creating response", http.StatusInternalServerError)
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
	domain := "." + os.Getenv("DOMAIN")
	expiresIn := time.Now().Unix() + int64(res.ExpiresIn)

	if domain == "." {
		domain = "localhost"
	}

	// check from api gateway headers
	if r.Header.Get("X-Forwarded-Proto") == "https" {
		secure = true
	}

	csrfTokenCookie := &http.Cookie{
		Name:     "csrfToken",
		Value:    csrfToken,
		Expires:  time.Now().Add(3 * time.Hour),
		HttpOnly: false,
		SameSite: http.SameSiteLaxMode,
		Secure:   secure,
		Domain:   domain,
		Path:     "/",
	}

	accessTokenCookie := &http.Cookie{
		Name:     "accessToken",
		Value:    *res.AccessToken,
		Expires:  time.Now().Add(10 * time.Minute),
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   secure,
		Domain:   domain,
		Path:     "/",
	}

	refreshTokenCookie := &http.Cookie{
		Name:     "refreshToken",
		Value:    *res.RefreshToken,
		Expires:  time.Now().Add(3 * time.Hour),
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   secure,
		Domain:   domain,
		Path:     "/",
	}

	expiresInCookie := &http.Cookie{
		Name:     "tokenExpiresIn",
		Value:    strconv.FormatInt(expiresIn, 10),
		Expires:  time.Now().Add(3 * time.Hour),
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

	clog.Logger.Success("(AUTH) SignInUser => success")

	successResponse(w, SignInUserResponse{ExpiresIn: res.ExpiresIn})
}

func (h *AuthHandler) RefreshAccessToken(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(AUTH) RefreshAccessToken => invoked")

	refreshToken, errorRefreshToken := r.Cookie("refreshToken")
	if errorRefreshToken != nil {
		if errorRefreshToken == http.ErrNoCookie {
			errorResponse(w, http.StatusUnauthorized, "No refresh token found")
			return
		}
		errorResponse(w, http.StatusBadRequest, "Error reading cookie")
		return
	}

	accessToken, errorAccessToken := r.Cookie("accessToken")
	if errorAccessToken != nil {
		if errorAccessToken == http.ErrNoCookie {
			errorResponse(w, http.StatusUnauthorized, "No access token found")
			return
		}
		errorResponse(w, http.StatusBadRequest, "Error reading cookie")
		return
	}

	userId, errUserId := h.cognitoService.GetUserId(accessToken.Value)
	if errUserId != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid Access Token")
		return
	}

	res, err := h.cognitoService.RefreshAccessToken(userId, refreshToken.Value)
	if err != nil {
		errorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	clog.Logger.Info("(AUTH) RefreshAccessToken => success")

	secure := r.TLS != nil
	domain := "." + os.Getenv("DOMAIN")

	if domain == "." {
		domain = "localhost"
	}

	// check from api gateway headers
	if r.Header.Get("X-Forwarded-Proto") == "https" {
		secure = true
	}

	accessTokenCookie := &http.Cookie{
		Name:     "accessToken",
		Value:    *res.AccessToken,
		Expires:  time.Now().Add(10 * time.Minute),
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   secure,
		Domain:   domain,
		Path:     "/",
	}

	expiresIn := time.Now().Unix() + int64(res.ExpiresIn)

	expiresInCookie := &http.Cookie{
		Name:     "tokenExpiresIn",
		Value:    strconv.FormatInt(expiresIn, 10),
		Expires:  time.Now().Add(3 * time.Hour),
		HttpOnly: false,
		SameSite: http.SameSiteLaxMode,
		Secure:   secure,
		Domain:   domain,
		Path:     "/",
	}

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
