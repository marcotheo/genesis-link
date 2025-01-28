package handler

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	v4 "github.com/aws/aws-sdk-go-v2/aws/signer/v4"
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
	s3Service      *services.S3Service
}

func InitOrgHandler(dataService *services.DataService, utilService *services.UtilService, cognitoService *services.CognitoService, s3Service *services.S3Service) *OrgHandler {
	return &OrgHandler{
		dataService:    dataService,
		utilService:    utilService,
		cognitoService: cognitoService,
		s3Service:      s3Service,
	}
}

type CreateOrgParams struct {
	Company       string `json:"company" validate:"required"`
	Email         string `json:"email" validate:"required"`
	ContactNumber string `json:"contactNumber"`
	BannerLink    string `json:"bannerLink"`
	LogoLink      string `json:"logoLink"`
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
	dbData.Bannerlink = h.utilService.StringToNullString(params.BannerLink)
	dbData.Logolink = h.utilService.StringToNullString(params.LogoLink)

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
	Organizations []OrganizationPartial `json:"organizations"`
	Total         int64                 `json:"total"`
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

	var limit int64 = 5

	organizations, errQ := h.dataService.Queries.GetOrganizationsByUserId(context.Background(), db.GetOrganizationsByUserIdParams{
		Offset: int64((page - 1)) * limit,
		Userid: userId,
		Limit:  limit,
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

type GetOrganizationDetailsByOrgIdResponse struct {
	Company       string `json:"company"`
	Email         string `json:"email"`
	Contactnumber string `json:"contactNumber"`
	CreatedAt     int64  `json:"createdAt,omitempty"`
}

func (h *OrgHandler) GetOrganizationDetailsByOrgId(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(GET) GetOrganizationDetailsByOrgId => invoked")

	orgId := r.PathValue("orgId")

	result, errQ := h.dataService.Queries.GetOrganizationDetailsByOrgId(context.Background(), orgId)
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(GET) GetOrganizationDetailsByOrgId => errQ %s \n", errQ))
		http.Error(w, "Something Went Wrong", http.StatusInternalServerError)
		return
	}

	clog.Logger.Success("(GET) GetOrganizationDetailsByOrgId => success")

	successResponse(w, GetOrganizationDetailsByOrgIdResponse{
		Company:       result.Company,
		Email:         result.Email,
		Contactnumber: h.utilService.ConvertNullString(result.Contactnumber),
		CreatedAt:     h.utilService.ConvertNullTime(result.CreatedAt),
	})
}

type GetOrganizationAssetsByOrgIdResponse struct {
	Bannerlink *v4.PresignedHTTPRequest `json:"bannerLink"`
	Logolink   *v4.PresignedHTTPRequest `json:"logoLink"`
}

func (h *OrgHandler) GetOrganizationAssetsByOrgId(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(GET) GetOrganizationAssetsByOrgId => invoked")

	orgId := r.PathValue("orgId")

	result, errQ := h.dataService.Queries.GetOrganizationAssetsByOrgId(context.Background(), orgId)
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(GET) GetOrganizationAssetsByOrgId => errQ %s \n", errQ))
		http.Error(w, "Something Went Wrong", http.StatusInternalServerError)
		return
	}

	var bannerSignedLink *v4.PresignedHTTPRequest
	var logoSignedLink *v4.PresignedHTTPRequest

	if result.Bannerlink.Valid {
		signedLink, err := h.s3Service.GetObjectUrl(result.Bannerlink.String, 300)
		if err != nil {
			clog.Logger.Error(fmt.Sprintf("(GET) GetOrganizationAssetsByOrgId => err Bannerlink %s \n", err))
			http.Error(w, "error obtaining banner signed link", http.StatusInternalServerError)
			return
		}

		bannerSignedLink = signedLink
	}

	if result.Logolink.Valid {
		signedLink, err := h.s3Service.GetObjectUrl(result.Logolink.String, 300)
		if err != nil {
			http.Error(w, "error obtaining logo signed link", http.StatusInternalServerError)
			return
		}

		logoSignedLink = signedLink
	}

	clog.Logger.Success("(GET) GetOrganizationAssetsByOrgId => success")

	successResponse(w, GetOrganizationAssetsByOrgIdResponse{
		Bannerlink: bannerSignedLink,
		Logolink:   logoSignedLink,
	})
}

type UpdateBrandingAssetsParams struct {
	LogoLink   string `json:"logoLink"`
	BannerLink string `json:"bannerLink"`
}

func (h *OrgHandler) UpdateBrandingAssets(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(POST) UpdateBrandingAssets => invoked")

	orgId := r.PathValue("orgId")

	var params UpdateBrandingAssetsParams

	errRead := ReadAndValidateBody(r, &params)
	if errRead != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) UpdateBrandingAssets => ReadAndValidateBody %s", errRead))
		http.Error(w, errRead.Error(), http.StatusBadRequest)
		return
	}

	if params.LogoLink != "" {
		errQ := h.dataService.Queries.UpdateLogoLink(context.Background(), db.UpdateLogoLinkParams{
			Orgid:    orgId,
			Logolink: h.utilService.StringToNullString(params.LogoLink),
		})
		if errQ != nil {
			clog.Logger.Error(fmt.Sprintf("(POST) UpdateBrandingAssets => errQ %s \n", errQ))
			http.Error(w, "Something Went Wrong", http.StatusInternalServerError)
			return
		}
	}

	if params.BannerLink != "" {
		errQ := h.dataService.Queries.UpdateBannerLink(context.Background(), db.UpdateBannerLinkParams{
			Orgid:      orgId,
			Bannerlink: h.utilService.StringToNullString(params.BannerLink),
		})
		if errQ != nil {
			clog.Logger.Error(fmt.Sprintf("(POST) UpdateBrandingAssets => errQ %s \n", errQ))
			http.Error(w, "Something Went Wrong", http.StatusInternalServerError)
			return
		}
	}

	clog.Logger.Success("(POST) UpdateBrandingAssets => update successful")

	w.WriteHeader(http.StatusNoContent)
}
