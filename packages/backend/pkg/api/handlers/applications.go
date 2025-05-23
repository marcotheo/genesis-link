package handler

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
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
	s3Service      *services.S3Service
}

func InitApplicationHandler(dataService *services.DataService, utilService *services.UtilService, cognitoService *services.CognitoService, s3Service *services.S3Service) *ApplicationHandler {
	return &ApplicationHandler{
		dataService:    dataService,
		utilService:    utilService,
		cognitoService: cognitoService,
		s3Service:      s3Service,
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

type ApplicantApplication struct {
	Applicationid string `json:"applicationId"`
	Company       string `json:"company"`
	Title         string `json:"title"`
	Status        string `json:"status"`
	Postid        string `json:"postId"`
	CreatedAt     int64  `json:"createdAt"`
}

type GetApplicationsByUserIdResponse struct {
	Applications []ApplicantApplication `json:"applications"`
	Total        int64                  `json:"total"`
}

func (h *ApplicationHandler) GetApplicationsByUserId(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(GET) GetApplicationsByUserId => invoked")

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

	var limit int64 = 5

	applications, errQ := h.dataService.Queries.GetApplicationsByUserId(context.Background(), db.GetApplicationsByUserIdParams{
		Offset: int64((page - 1)) * limit,
		Userid: userId,
		Limit:  limit,
	})
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(GET) GetApplicationsByUserId => errQ %s \n", errQ))
		http.Error(w, "Error fetching applications", http.StatusInternalServerError)
		return
	}

	totalCount, errQ := h.dataService.Queries.GetApplicationsByUserIdCount(context.Background(), userId)
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(GET) GetApplicationsByUserId => errQ %s \n", errQ))
		http.Error(w, "Error fetching applications count", http.StatusInternalServerError)
		return
	}

	var response []ApplicantApplication

	for _, row := range applications {
		item := ApplicantApplication{
			Applicationid: row.Applicationid,
			Company:       h.utilService.ConvertNullString(row.Company),
			Title:         h.utilService.ConvertNullString(row.Title),
			Status:        row.Status,
			Postid:        row.Postid,
			CreatedAt:     h.utilService.ConvertNullTime(row.CreatedAt),
		}

		response = append(response, item)
	}

	clog.Logger.Success("(GET) GetApplicationsByUserId => successful")

	successResponse(w, GetApplicationsByUserIdResponse{Applications: response, Total: totalCount})
}

type EmployerPostApplication struct {
	Name          string `json:"name"`
	Email         string `json:"email"`
	MobileNumber  string `json:"mobileNumber"`
	Userid        string `json:"userId"`
	Applicationid string `json:"applicationId"`
	Status        string `json:"status"`
	CreatedAt     int64  `json:"createdAt"`
}

type GetApplicationsByPostIdParams struct {
	Page int64 `json:"page" validate:"required"`
}

type GetApplicationsByPostIdResponse struct {
	Applications []EmployerPostApplication `json:"applications"`
	Total        int64                     `json:"total"`
}

func (h *ApplicationHandler) GetApplicationsByPostId(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(GET) GetApplicationsByPostId => invoked")

	postId := r.PathValue("postId")

	var params GetApplicationsByPostIdParams

	if err := ParseAndValidateQuery(r, &params); err != nil {
		clog.Logger.Error(fmt.Sprintf("(GET) GetApplicationsByPostId => invalid parameters %s \n", err))
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var limit int64 = 5

	applications, errQ := h.dataService.Queries.GetApplicationsByPostId(context.Background(), db.GetApplicationsByPostIdParams{
		Offset: int64((params.Page - 1)) * limit,
		Postid: postId,
		Limit:  limit,
	})
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(GET) GetApplicationsByPostId => errQ %s \n", errQ))
		http.Error(w, "Error fetching applications", http.StatusInternalServerError)
		return
	}

	totalCount, errQ := h.dataService.Queries.GetApplicationsByPostIdCount(context.Background(), postId)
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(GET) GetApplicationsByPostId => errQ %s \n", errQ))
		http.Error(w, "Error fetching applications count", http.StatusInternalServerError)
		return
	}

	var response []EmployerPostApplication

	for _, row := range applications {
		item := EmployerPostApplication{
			Applicationid: row.Applicationid,
			Userid:        row.Userid,
			Name:          h.utilService.ConvertNullString(row.Firstname) + " " + h.utilService.ConvertNullString(row.Lastname),
			Email:         h.utilService.ConvertNullString(row.Email),
			MobileNumber:  h.utilService.ConvertNullString(row.Mobilenumber),
			Status:        row.Status,
			CreatedAt:     h.utilService.ConvertNullTime(row.CreatedAt),
		}

		response = append(response, item)
	}

	clog.Logger.Success("(GET) GetApplicationsByPostId => successful")

	successResponse(w, GetApplicationsByPostIdResponse{Applications: response, Total: totalCount})
}

type GetResumeLinkByApplicationIdResponse struct {
	ResumeLink string `json:"resumeLink"`
}

func (h *ApplicationHandler) GetResumeLinkByApplicationId(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(GET) GetResumeLinkByApplicationId => invoked")

	applicationId := r.PathValue("applicationId")

	s3ResumeKey, errQ := h.dataService.Queries.GetResumeLinkByApplicationId(context.Background(), applicationId)
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(GET) GetResumeLinkByApplicationId => errQ %s \n", errQ))
		http.Error(w, "Error fetching proposal link", http.StatusInternalServerError)
		return
	}

	resumeLink := ""

	if s3ResumeKey.Valid {
		resumeLink = h.utilService.CloudfrontUrl + "/" + s3ResumeKey.String
	}

	clog.Logger.Success("(GET) GetResumeLinkByApplicationId => successful")

	successResponse(w, GetResumeLinkByApplicationIdResponse{ResumeLink: resumeLink})
}

type GetProposalLinkByApplicationIdResponse struct {
	ProposalLink string `json:"prosalLink"`
}

func (h *ApplicationHandler) GetProposalLinkByApplicationId(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(GET) GetProposalLinkByApplicationId => invoked")

	applicationId := r.PathValue("applicationId")

	s3ProposalKey, errQ := h.dataService.Queries.GetProposalLinkByApplicationId(context.Background(), applicationId)
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(GET) GetProposalLinkByApplicationId => errQ %s \n", errQ))
		http.Error(w, "Error fetching proposal link", http.StatusInternalServerError)
		return
	}

	proposalLink := ""

	if s3ProposalKey.Valid {
		proposalLink = h.utilService.CloudfrontUrl + "/" + s3ProposalKey.String
	}

	clog.Logger.Success("(GET) GetProposalLinkByApplicationId => successful")

	successResponse(w, GetProposalLinkByApplicationIdResponse{ProposalLink: proposalLink})
}
