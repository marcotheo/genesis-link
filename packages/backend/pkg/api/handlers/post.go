package handler

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"strconv"

	"github.com/jinzhu/copier"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/db"
	clog "github.com/marcotheo/genesis-link/packages/backend/pkg/logger"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/services"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

type PostHandler struct {
	dataService    *services.DataService
	utilService    *services.UtilService
	cognitoService *services.CognitoService
}

func InitPostHandler(dataService *services.DataService, utilService *services.UtilService, cognitoService *services.CognitoService) *PostHandler {
	return &PostHandler{
		dataService:    dataService,
		utilService:    utilService,
		cognitoService: cognitoService,
	}
}

type CreateJobPostParamsValidation struct {
	Title       string `json:"title" validate:"required"`
	Description string `json:"description" validate:"required"`
	PostType    string `json:"postType" validate:"required,oneof=job volunteer"`
	JobType     string `json:"jobType" validate:"omitempty,oneof=full-time part-time contract internship"`
	Company     string `json:"company" validate:"required"`
	Location    string `json:"location" validate:"required"`
	Salary      int    `json:"salary" validate:"omitempty,gte=0"` // Ensure Salary is a non-negative integer
	Wfh         int    `json:"wfh" validate:"required,oneof=0 1"`
	Email       string `json:"email" validate:"required"`
	Phone       string `json:"phone" validate:"required"`
	Deadline    string `json:"deadline" validate:"required,date"`
}

func (h *PostHandler) CreateJobPost(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(POST) CreateUser => invoked")

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

	var jobPostValidation CreateJobPostParamsValidation

	errRead := ReadAndValidateBody(r, &jobPostValidation)
	if errRead != nil {
		http.Error(w, errRead.Error(), http.StatusBadRequest)
		return
	}

	// Convert deadline to UNIX timestamp
	deadlineTimestamp, err := convertToUnixTimestamp(jobPostValidation.Deadline)
	if err != nil {
		http.Error(w, "Invalid deadline format", http.StatusBadRequest)
		return
	}

	// pass the validated data to actual db params
	var jobPostData db.CreateJobPostParams
	errCopier := copier.Copy(&jobPostData, &jobPostValidation)
	if errCopier != nil {
		clog.Logger.Error(fmt.Sprintf("(USER) CreateUser => Error copying: %s", errCopier))
		errorResponse(w, http.StatusInternalServerError, "Something Went Wrong")
		return
	}

	id, err := gonanoid.New()
	if err != nil {
		fmt.Println("Error generating ID:", err)
		return
	}

	jobPostData.Postid = id
	jobPostData.Userid = userId
	jobPostData.Deadline = sql.NullInt64{Int64: deadlineTimestamp, Valid: true}

	errQ := h.dataService.Queries.CreateJobPost(context.Background(), jobPostData)
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(USER) CreateUser => errQ %s \n", errQ))
		http.Error(w, "Error creating response", http.StatusInternalServerError)
		return
	}

	clog.Logger.Success("(POST) CreateJobPost => create successful")

	w.WriteHeader(http.StatusOK)
}

type GetPostsResponse struct {
	Posts []db.GetPostsByUserIdRow
	Total int64
}

func (h *PostHandler) GetPosts(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(POST) GetPosts => invoked")

	pageStr := r.URL.Query().Get("page")
	if pageStr == "" {
		http.Error(w, "Page parameter is required", http.StatusBadRequest)
		return
	}

	page, err := strconv.Atoi(pageStr)
	if err != nil {
		http.Error(w, "Page must be a number", http.StatusBadRequest)
		return
	}

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

	posts, errQ := h.dataService.Queries.GetPostsByUserId(context.Background(), db.GetPostsByUserIdParams{Offset: int64((page - 1) * 10), Userid: userId})
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(USER) GetPosts => errQ %s \n", errQ))
		http.Error(w, "Error fetching response", http.StatusInternalServerError)
		return
	}

	totalCount, errQ := h.dataService.Queries.GetPostCountByUserId(context.Background(), userId)
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(USER) GetPosts => errQ %s \n", errQ))
		http.Error(w, "Error fetching response", http.StatusInternalServerError)
		return
	}

	clog.Logger.Success("(POST) GetPosts => successful")

	successResponse(w, GetPostsResponse{Posts: posts, Total: totalCount})
}
