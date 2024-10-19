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

type CreatePostParams struct {
	Company            string `json:"company" validate:"required"`
	Title              string `json:"title" validate:"required"`
	Description        string `json:"description"`
	PosterLink         string `json:"posterLink"`
	LogoLink           string `json:"logoLink"`
	AdditionalInfoLink string `json:"additionalInfoLink"`
	Wfh                int    `json:"wfh" validate:"oneof=0 1"`
	Email              string `json:"email" validate:"required"`
	Phone              string `json:"phone" validate:"required"`
	Deadline           string `json:"deadline" validate:"required,date"`
	AddressId          string `json:"addressId" validate:"required,nanoid"`
}

type CreatePostResponse struct {
	PostId string
}

func (h *PostHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(POST) CreatePost => invoked")

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

	var createPostParams CreatePostParams

	errRead := ReadAndValidateBody(r, &createPostParams)
	if errRead != nil {
		http.Error(w, errRead.Error(), http.StatusBadRequest)
		return
	}

	// Convert deadline to UNIX timestamp
	deadlineTimestamp, err := convertToUnixTimestamp(createPostParams.Deadline)
	if err != nil {
		http.Error(w, "Invalid deadline format", http.StatusBadRequest)
		return
	}

	// pass the validated data to actual db params
	var postData db.CreatePostParams
	errCopier := copier.Copy(&postData, &createPostParams)
	if errCopier != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreatePost => Error copying: %s", errCopier))
		errorResponse(w, http.StatusInternalServerError, "Something Went Wrong")
		return
	}

	id, err := gonanoid.New()
	if err != nil {
		fmt.Println("Error generating ID:", err)
		return
	}

	postData.Postid = id
	postData.Userid = userId
	postData.Deadline = sql.NullInt64{Int64: deadlineTimestamp, Valid: true}

	errQ := h.dataService.Queries.CreatePost(context.Background(), postData)
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreatePost => errQ %s \n", errQ))
		http.Error(w, "Error creating response", http.StatusInternalServerError)
		return
	}

	clog.Logger.Success("(POST) CreatePost => create successful")

	successResponse(w, CreatePostResponse{PostId: id})
}

type CreateJobDetailsParams struct {
	Postid          string `json:"postId" validate:"required,nanoid"`
	JobType         string `json:"jobType" validate:"oneof=full-time part-time contract internship"`
	SalaryType      string `json:"salaryType" validate:"omitempty,oneof=fixed hourly monthly"`
	SalaryAmountMin int    `json:"salaryAmountMin"`
	SalaryAmountMax int    `json:"salaryAmountMax"`
	SalaryCurrency  string `json:"salaryCurrency"`
}

func (h *PostHandler) CreateJobDetails(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(POST) CreateJobDetails => invoked")

	var jobDetailsParams CreateJobDetailsParams

	errRead := ReadAndValidateBody(r, &jobDetailsParams)
	if errRead != nil {
		http.Error(w, errRead.Error(), http.StatusBadRequest)
		return
	}

	// pass the validated data to actual db params
	var jobDetailsData db.CreateJobDetailsParams
	errCopier := copier.Copy(&jobDetailsData, &jobDetailsParams)
	if errCopier != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreateJobDetails => Error copying: %s", errCopier))
		errorResponse(w, http.StatusInternalServerError, "Something Went Wrong")
		return
	}

	id, err := gonanoid.New()
	if err != nil {
		fmt.Println("Error generating ID:", err)
		return
	}

	jobDetailsData.Jobdetailid = id

	errQ := h.dataService.Queries.CreateJobDetails(context.Background(), jobDetailsData)
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreateJobDetails => errQ %s \n", errQ))
		http.Error(w, "Error creating response", http.StatusInternalServerError)
		return
	}

	clog.Logger.Success("(POST) CreateJobDetails => create successful")

	w.WriteHeader(http.StatusOK)
}

type PostRequirementsParams struct {
	Postid          string `json:"postId" validate:"required,nanoid"`
	RequirementType string `json:"requirementType" validate:"required,oneof=responsibility qualification"`
	Requirement     string `json:"requirement" validate:"required,min=5,max=500"`
}

func (h *PostHandler) CreatePostRequirements(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(POST) CreatePostRequirements => invoked")

	var postRequirementsParams PostRequirementsParams

	errRead := ReadAndValidateBody(r, &postRequirementsParams)
	if errRead != nil {
		http.Error(w, errRead.Error(), http.StatusBadRequest)
		return
	}

	// pass the validated data to actual db params
	var postRequirement db.CreatePostRequirementParams
	errCopier := copier.Copy(&postRequirement, &postRequirementsParams)
	if errCopier != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreatePostRequirements => Error copying: %s", errCopier))
		errorResponse(w, http.StatusInternalServerError, "Something Went Wrong")
		return
	}

	id, err := gonanoid.New()
	if err != nil {
		fmt.Println("Error generating ID:", err)
		return
	}

	postRequirement.Requirementid = id

	errQ := h.dataService.Queries.CreatePostRequirement(context.Background(), postRequirement)
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreatePostRequirements => errQ %s \n", errQ))
		http.Error(w, "Error creating response", http.StatusInternalServerError)
		return
	}

	clog.Logger.Success("(POST) CreatePostRequirements => create successful")

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
