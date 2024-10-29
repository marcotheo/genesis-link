package handler

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"

	"github.com/jinzhu/copier"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/db"
	clog "github.com/marcotheo/genesis-link/packages/backend/pkg/logger"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/services"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

type AddressHandler struct {
	dataService    *services.DataService
	utilService    *services.UtilService
	cognitoService *services.CognitoService
}

func InitAddressHandler(dataService *services.DataService, utilService *services.UtilService, cognitoService *services.CognitoService) *AddressHandler {
	return &AddressHandler{
		dataService:    dataService,
		utilService:    utilService,
		cognitoService: cognitoService,
	}
}

type CreateAddressParams struct {
	Country        string `json:"country" validate:"required"`
	Region         string `json:"region"`
	Province       string `json:"province"`
	City           string `json:"city" validate:"required"`
	Barangay       string `json:"barangay"`
	AddressDetails string `json:"addressDetails"`
}

type CreateAddressResponse struct {
	AddressId string
}

func (h *AddressHandler) CreateAddress(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(POST) CreateAddress => invoked")

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

	var createAddressParams CreateAddressParams

	errRead := ReadAndValidateBody(r, &createAddressParams)
	if errRead != nil {
		http.Error(w, errRead.Error(), http.StatusBadRequest)
		return
	}

	// pass the validated data to actual db params
	var addressData db.CreateAddressParams
	errCopier := copier.Copy(&addressData, &createAddressParams)
	if errCopier != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreateAddress => Error copying: %s", errCopier))
		errorResponse(w, http.StatusInternalServerError, "Something Went Wrong")
		return
	}

	id, err := gonanoid.New()
	if err != nil {
		fmt.Println("Error generating ID:", err)
		return
	}

	addressData.Addressid = id
	addressData.Userid = sql.NullString{String: userId, Valid: true}

	errQ := h.dataService.Queries.CreateAddress(context.Background(), addressData)
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreateAddress => errQ %s \n", errQ))
		http.Error(w, "Error creating response", http.StatusInternalServerError)
		return
	}

	clog.Logger.Success("(POST) CreateAddress => create successful")

	successResponse(w, CreateAddressResponse{AddressId: id})
}

func (h *AddressHandler) GetAddressesByUserId(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(POST) GetAddressesByUserId => invoked")

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

	res, errQ := h.dataService.Queries.GetAllAddressByUserId(context.Background(), sql.NullString{
		String: userId,
		Valid:  true, // Indicates the value is not NULL
	})

	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) GetAddressesByUserId => errQ %s \n", errQ))
		http.Error(w, "Error creating response", http.StatusInternalServerError)
		return
	}

	clog.Logger.Success("(POST) GetAddressesByUserId => create successful")

	successResponse(w, res)
}
