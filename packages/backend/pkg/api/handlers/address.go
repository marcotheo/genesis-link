package handler

import (
	"context"
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
	AddressId string `json:"addressId"`
}

func (h *AddressHandler) CreateAddress(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(POST) CreateAddress => invoked")

	orgId := r.PathValue("orgId")

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
	addressData.Orgid = orgId

	errQ := h.dataService.Queries.CreateAddress(context.Background(), addressData)
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreateAddress => errQ %s \n", errQ))
		http.Error(w, "Error creating response", http.StatusInternalServerError)
		return
	}

	clog.Logger.Success("(POST) CreateAddress => create successful")

	successResponse(w, CreateAddressResponse{AddressId: id})
}

type AddressResponse struct {
	AddressID      string `json:"Addressid"`
	Country        string `json:"Country"`
	Region         string `json:"Region,omitempty"`
	Province       string `json:"Province,omitempty"`
	City           string `json:"City,omitempty"`
	Barangay       string `json:"Barangay,omitempty"`
	AddressDetails string `json:"Addressdetails,omitempty"`
}

func (h *AddressHandler) GetAddressesByOrgId(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(GET) GetAddressesByOrgId => invoked")

	orgId := r.PathValue("orgId")

	addresses, errQ := h.dataService.Queries.GetAllAddressByOrgId(context.Background(), orgId)

	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(GET) GetAddressesByOrgId => errQ %s \n", errQ))
		http.Error(w, "Error creating response", http.StatusInternalServerError)
		return
	}

	clog.Logger.Success("(GET) GetAddressesByOrgId => fetch successful")

	var addressResponses []AddressResponse

	for _, addr := range addresses {
		itemData := AddressResponse{
			AddressID:      addr.Addressid,
			Country:        addr.Country,
			Region:         h.utilService.ConvertNullString(addr.Region),
			Province:       h.utilService.ConvertNullString(addr.Province),
			City:           h.utilService.ConvertNullString(addr.City),
			Barangay:       h.utilService.ConvertNullString(addr.Barangay),
			AddressDetails: h.utilService.ConvertNullString(addr.Addressdetails),
		}

		addressResponses = append(addressResponses, itemData)
	}

	successResponse(w, addressResponses)
}

func (h *AddressHandler) DeleteAddressById(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(DELETE) DeleteAddressById => invoked")

	orgId := r.PathValue("orgId")
	addressId := r.PathValue("addressId")

	errQ := h.dataService.Queries.DeleteAddress(context.Background(), db.DeleteAddressParams{
		Orgid:     orgId,
		Addressid: addressId,
	})

	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(DELETE) DeleteAddressById => errQ %s \n", errQ))
		http.Error(w, "Error creating response", http.StatusInternalServerError)
		return
	}

	clog.Logger.Success("(DELETE) DeleteAddressById => delete successful")

	w.WriteHeader(http.StatusNoContent)
}
