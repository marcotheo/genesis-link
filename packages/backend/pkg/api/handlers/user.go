package handler

import (
	"context"
	"fmt"
	"net/http"

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

func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(AUTH) GetUser => invoked")

	userId := r.PathValue("userId")

	user, err := h.dataService.Queries.GetUser(context.Background(), userId)

	if err != nil {
		fmt.Printf("err %s \n", err)
		clog.Logger.Error(fmt.Sprintf("(AUTH) GetUser => error in query get user = (%s) \n", err))
		errorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	if user.Userid == "" {
		clog.Logger.Error("(AUTH) GetUser => user does not exist")
		errorResponse(w, http.StatusBadRequest, "User does not exist!")
		return
	}

	clog.Logger.Success("(AUTH) GetUser => details successfuly retrieved")

	successResponse(w, user)
}

type UpdateResumeLinkParams struct {
	ResumeLink string `json:"resumeLink" validate:"required"`
}

func (h *UserHandler) UpdateResumeLink(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(POST) UpdateResumeLink => invoked")

	token, errorAccessToken := r.Cookie("accessToken")
	if errorAccessToken != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userId, errUserId := h.cognitoService.GetUserId(token.Value)
	if errUserId != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid Access Token")
		return
	}

	var params UpdateResumeLinkParams

	errRead := ReadAndValidateBody(r, &params)
	if errRead != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) UpdateResumeLink => ReadAndValidateBody %s", errRead))
		http.Error(w, errRead.Error(), http.StatusBadRequest)
		return
	}

	errQ := h.dataService.Queries.UpdateResumeLink(context.Background(), db.UpdateResumeLinkParams{
		Userid:     userId,
		Resumelink: h.utilService.StringToNullString(params.ResumeLink),
	})

	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) UpdateResumeLink => errQ %s \n", errQ))
		http.Error(w, "Something Went Wrong", http.StatusInternalServerError)
		return
	}

	clog.Logger.Success("(POST) UpdateResumeLink => update successful")

	w.WriteHeader(http.StatusNoContent)
}
