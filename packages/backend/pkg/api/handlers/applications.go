package handler

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/marcotheo/genesis-link/packages/backend/pkg/db"
	clog "github.com/marcotheo/genesis-link/packages/backend/pkg/logger"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/services"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

type ApplicationHandler struct {
	dataService    *services.DataService
	utilService    *services.UtilService
	cognitoService *services.CognitoService
}

func InitApplicationHandler(dataService *services.DataService, utilService *services.UtilService, cognitoService *services.CognitoService) *ApplicationHandler {
	return &ApplicationHandler{
		dataService:    dataService,
		utilService:    utilService,
		cognitoService: cognitoService,
	}
}

type CreateApplicationParams struct {
	Postid       string `json:"postId" validate:"required,nanoid"`
	Proposallink string `json:"proposalLink"`
}

func (h *ApplicationHandler) CreateApplication(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(POST) CreateApplication => invoked")

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

	var params CreateApplicationParams

	errRead := ReadAndValidateBody(r, &params)
	if errRead != nil {
		http.Error(w, errRead.Error(), http.StatusBadRequest)
		return
	}

	id, err := gonanoid.New()
	if err != nil {
		fmt.Println("Error generating ID:", err)
		return
	}
	_, errQ := h.dataService.Queries.CreateApplication(context.Background(), db.CreateApplicationParams{
		Applicationid: id,
		Proposallink:  h.utilService.StringToNullString(params.Proposallink),
		Status:        "APPLIED",
		Userid:        userId,
		Postid:        params.Postid,
	})

	if errQ != nil {
		errMsg := errQ.Error()

		if strings.Contains(errMsg, "UNIQUE constraint failed") {
			clog.Logger.Error(fmt.Sprintf("(POST) CreateApplication => duplicate application for userId=%s, postId=%s", userId, params.Postid))
			http.Error(w, "You have already sent an application for this post.", http.StatusConflict) // 409 Conflict
			return
		}

		clog.Logger.Error(fmt.Sprintf("(POST) CreateApplication => error creating post: %s", errMsg))
		http.Error(w, "Error creating application.", http.StatusInternalServerError)
		return
	}

	clog.Logger.Success("(POST) CreateApplication => create successful")

	w.WriteHeader(http.StatusNoContent)
}
