package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/marcotheo/genesis-fleet/packages/backend/pkg/db"
	clog "github.com/marcotheo/genesis-fleet/packages/backend/pkg/logger"
	"github.com/marcotheo/genesis-fleet/packages/backend/pkg/services"
)

type UserHandler struct {
	dataService *services.DataService
	cognitoSvc  *services.CognitoService
}

type CreateUserParamsValidation struct {
	Username  string `json:"username" validate:"required"`
	Password  string `json:"password" validate:"required"`
	Firstname string `json:"first_name" validate:"required"`
	Lastname  string `json:"last_name" validate:"required"`
	Email     string `json:"email" validate:"required,email"`
}

func InitUserHandler(dataService *services.DataService, cognitoSvc *services.CognitoService) *UserHandler {
	return &UserHandler{
		dataService: dataService,
		cognitoSvc:  cognitoSvc,
	}
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
	err := h.cognitoSvc.SignUpUser(userValidation.Username, userValidation.Password)
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

	userData.Userid = uuid.New().String()

	user, errQ := h.dataService.Queries.CreateUser(context.Background(), userData)
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(USER) CreateUser => errQ %s \n", errQ))
		http.Error(w, "Error creating response", http.StatusInternalServerError)
		return
	}

	response, errMarshal := json.Marshal(user)
	if errMarshal != nil {
		clog.Logger.Error(fmt.Sprintf("(USER) CreateUser => error in json.marshal %s \n", errMarshal))
		http.Error(w, "Error creating response", http.StatusInternalServerError)
		return
	}

	clog.Logger.Success("(USER) CreateUser => create successful")

	w.Header().Set("Content-Type", "application/json")
	w.Write(response)
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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Response{Status: "success", Data: user})
}
