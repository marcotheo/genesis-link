package handler

import (
	"context"
	"fmt"
	"net/http"

	"github.com/jinzhu/copier"
	"github.com/marcotheo/genesis-fleet/packages/backend/pkg/db"
	clog "github.com/marcotheo/genesis-fleet/packages/backend/pkg/logger"
	"github.com/marcotheo/genesis-fleet/packages/backend/pkg/services"
)

type UserHandler struct {
	dataService *services.DataService
	cognitoSvc  *services.CognitoService
}

func InitUserHandler(dataService *services.DataService, cognitoSvc *services.CognitoService) *UserHandler {
	return &UserHandler{
		dataService: dataService,
		cognitoSvc:  cognitoSvc,
	}
}

type CreateUserParamsValidation struct {
	Username  string `json:"username" validate:"required"`
	Password  string `json:"password" validate:"required"`
	Firstname string `json:"first_name" validate:"required"`
	Lastname  string `json:"last_name" validate:"required"`
	Email     string `json:"email" validate:"required,email"`
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
	userId, err := h.cognitoSvc.SignUpUser(userValidation.Username, userValidation.Password)
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
	Username  string `json:"username" validate:"required"`
	Password  string `json:"password" validate:"required"`
}

func (h *UserHandler) SignInUser(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(USER) SignInUser => invoked")

	var inputValidation SignInUserParamsValidation

	errRead := ReadAndValidateBody(r, &inputValidation)
	if errRead != nil {
		errorResponse(w, http.StatusBadRequest, errRead.Error())
		return
	}

	res, err := h.cognitoSvc.SignInUser(inputValidation.Username, inputValidation.Password)
	if err != nil {
		errorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	clog.Logger.Success("(USER) SignInUser => success")

	successResponse(w, res)
}