package handler

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/jinzhu/copier"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/db"
	clog "github.com/marcotheo/genesis-link/packages/backend/pkg/logger"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/services"
)

type UserHandler struct {
	dataService    *services.DataService
	cognitoService *services.CognitoService
	utilService    *services.UtilService
}

func InitUserHandler(dataService *services.DataService, cognitoService *services.CognitoService, utilService *services.UtilService) *UserHandler {
	return &UserHandler{
		dataService:    dataService,
		cognitoService: cognitoService,
		utilService:    utilService,
	}
}

type CreateUserParamsValidation struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(USER) CreateUser => invoked")

	var userValidation CreateUserParamsValidation

	errRead := ReadAndValidateBody(r, &userValidation)
	if errRead != nil {
		http.Error(w, errRead.Error(), http.StatusBadRequest)
		return
	}

	// create user in cognito user pool
	userId, err := h.cognitoService.SignUpUser(userValidation.Email, userValidation.Password)
	if err != nil {
		clog.Logger.Error(fmt.Sprintf("(USER) CreateUser => Error signing up user in cognito: %s", err))
		errorResponse(w, http.StatusInternalServerError, "Something Went Wrong")
		return
	}

	// pass to validated data to actual db params
	var userData db.CreateUserParams
	errCopier := copier.Copy(&userData, &userValidation)
	if errCopier != nil {
		clog.Logger.Error(fmt.Sprintf("(USER) CreateUser => Error copying: %s", errCopier))
		errorResponse(w, http.StatusInternalServerError, "Something Went Wrong")
		return
	}

	userData.Userid = userId

	user, errQ := h.dataService.Queries.CreateUser(context.Background(), userData)
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(USER) CreateUser => errQ %s \n", errQ))
		http.Error(w, "Error creating response", http.StatusInternalServerError)
		return
	}

	clog.Logger.Success("(USER) CreateUser => create successful")

	successResponse(w, user)
}

type ConfirmSignUpParamsValidation struct {
	Username string `json:"username" validate:"required"`
	Code     string `json:"code" validate:"required"`
}

type ConfirmSignUpResponse struct {
	Confirmed bool
}

func (h *UserHandler) ConfirmSignUp(w http.ResponseWriter, r *http.Request) {
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

func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(USER) GetUser => invoked")

	userId := r.PathValue("userId")

	user, err := h.dataService.Queries.GetUser(context.Background(), userId)

	if user.Userid == nil {
		clog.Logger.Error("(USER) GetUser => user does not exist")
		errorResponse(w, http.StatusBadRequest, "User does not exist!")
		return
	}

	if err != nil {
		fmt.Printf("err %s \n", err)
		clog.Logger.Error(fmt.Sprintf("(USER) GetUser => error in query get user = (%s) \n", err))
		errorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	clog.Logger.Success("(USER) GetUser => details successfuly retrieved")

	successResponse(w, user)
}

type SignInUserParamsValidation struct {
	Email    string `json:"email" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type SignInUserResponse struct {
	AccessToken string
	IdToken     string
	ExpiresIn   int32
}

func (h *UserHandler) SignInUser(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(USER) SignInUser => invoked")

	var inputValidation SignInUserParamsValidation

	errRead := ReadAndValidateBody(r, &inputValidation)
	if errRead != nil {
		errorResponse(w, http.StatusBadRequest, errRead.Error())
		return
	}

	sub, res, err := h.cognitoService.SignInUser(inputValidation.Email, inputValidation.Password)
	if err != nil {
		errorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	cookieValue, err := encrypt(AuthSession{
		RefreshToken: *res.RefreshToken,
		Sub:          sub,
	})

	if err != nil {
		fmt.Printf("error ito %v", err.Error())
		http.Error(w, "Failed to encrypt payload", http.StatusInternalServerError)
		return
	}

	secure := r.TLS != nil

	domain := os.Getenv("COOKIE_DOMAIN")
	if domain == "" {
		domain = "localhost" // Default value if the environment variable is not set
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "authSession",
		Value:    cookieValue,
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
		SameSite: http.SameSiteNoneMode,
		Secure:   secure,
		Domain:   domain,
		Path:     "/",
	})

	clog.Logger.Success("(USER) SignInUser => success")

	successResponse(w, SignInUserResponse{AccessToken: *res.AccessToken, IdToken: *res.IdToken, ExpiresIn: res.ExpiresIn})
}

func (h *UserHandler) RefreshAccessToken(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(USER) RefreshAccessToken => invoked")

	cookie, err := r.Cookie("authSession")

	if err != nil {
		if err == http.ErrNoCookie {
			errorResponse(w, http.StatusUnauthorized, "No refresh token found")
			return
		}
		errorResponse(w, http.StatusBadRequest, "Error reading cookie")
		return
	}

	var decryptedValue AuthSession
	err = decrypt(cookie.Value, &decryptedValue)
	if err != nil {
		http.Error(w, "Failed to decrypt cookie value", http.StatusInternalServerError)
		return
	}

	res, err := h.cognitoService.RefreshAccessToken(decryptedValue.Sub, decryptedValue.RefreshToken)
	if err != nil {
		errorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	clog.Logger.Info("(USER) RefreshAccessToken => success")

	successResponse(w, SignInUserResponse{AccessToken: *res.AccessToken, IdToken: *res.IdToken, ExpiresIn: res.ExpiresIn})
}
