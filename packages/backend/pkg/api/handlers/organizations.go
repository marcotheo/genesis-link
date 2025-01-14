package handler

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	"github.com/jinzhu/copier"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/db"
	clog "github.com/marcotheo/genesis-link/packages/backend/pkg/logger"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/services"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

type OrgHandler struct {
	dataService    *services.DataService
	utilService    *services.UtilService
	cognitoService *services.CognitoService
}

func InitOrgHandler(dataService *services.DataService, utilService *services.UtilService, cognitoService *services.CognitoService) *OrgHandler {
	return &OrgHandler{
		dataService:    dataService,
		utilService:    utilService,
		cognitoService: cognitoService,
	}
}

type CreateOrgParams struct {
	Company      string `json:"company" validate:"required"`
	Email        string `json:"email" validate:"required"`
	MobileNumber string `json:"mobileNumber" validate:"required"`
	PosterLink   string `json:"posterLink"`
	LogoLink     string `json:"logoLink"`
}

type CreateOrgResponse struct {
	OrgId string `json:"orgId"`
}

func (h *OrgHandler) CreateOrg(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(POST) CreateOrg => invoked")

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

	var params CreateOrgParams

	errRead := ReadAndValidateBody(r, &params)
	if errRead != nil {
		http.Error(w, errRead.Error(), http.StatusBadRequest)
		return
	}

	// pass the validated data to actual db params
	var dbData db.CreateOrganizationParams
	errCopier := copier.Copy(&dbData, &params)
	if errCopier != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreateOrg => Error copying: %s", errCopier))
		errorResponse(w, http.StatusInternalServerError, "Something Went Wrong")
		return
	}

	orgId, err := gonanoid.New()
	if err != nil {
		fmt.Println("Error generating ID:", err)
		return
	}

	dbData.Orgid = orgId
	dbData.Userid = userId

	errQ := h.dataService.Queries.CreateOrganization(context.Background(), dbData)
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreateOrg => errQ %s \n", errQ))
		http.Error(w, "Error inserting data", http.StatusInternalServerError)
		return
	}

	clog.Logger.Success("(POST) CreateOrg => create successful")

	successResponse(w, CreateOrgResponse{OrgId: orgId})
}

type OrganizationPartial struct {
	OrgId     string `json:"orgId"`
	Company   string `json:"company,omitempty"`
	Email     string `json:"email,omitempty"`
	CreatedAt int64  `json:"createdAt,omitempty"`
}

type GetOrgsByUserIdResponse struct {
	Organizations []OrganizationPartial
	Total         int64
}

func (h *OrgHandler) GetOrgsByUserId(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(GET) GetOrgsByUserId => invoked")

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

	organizations, errQ := h.dataService.Queries.GetOrganizationsByUserId(context.Background(), db.GetOrganizationsByUserIdParams{
		Offset: int64((page - 1) * 10),
		Userid: userId,
		Limit:  10,
	})
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(GET) GetOrgsByUserId => errQ %s \n", errQ))
		http.Error(w, "Error fetching response", http.StatusInternalServerError)
		return
	}

	totalCount, errQ := h.dataService.Queries.GetOrganizationsCountByuserId(context.Background(), userId)
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(GET) GetOrgsByUserId => errQ %s \n", errQ))
		http.Error(w, "Error fetching response", http.StatusInternalServerError)
		return
	}

	var orgsResponse []OrganizationPartial

	for _, org := range organizations {
		item := OrganizationPartial{
			OrgId:     org.Orgid,
			Company:   org.Company,
			Email:     org.Email,
			CreatedAt: h.utilService.ConvertNullTime(org.CreatedAt),
		}

		orgsResponse = append(orgsResponse, item)
	}

	clog.Logger.Success("(GET) GetOrgsByUserId => successful")

	successResponse(w, GetOrgsByUserIdResponse{Organizations: orgsResponse, Total: totalCount})
}
