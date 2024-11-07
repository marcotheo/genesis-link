package handler

import (
	"net/http"

	clog "github.com/marcotheo/genesis-link/packages/backend/pkg/logger"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/services"
)

type S3Handler struct {
	s3Service   *services.S3Service
	utilService *services.UtilService
}

func InitS3Handler(s3Service *services.S3Service, utilService *services.UtilService) *S3Handler {
	return &S3Handler{
		utilService: utilService,
		s3Service:   s3Service,
	}
}

type CreatePutObjectSignedUrlParams struct {
	Key string `json:"key" validate:"required"`
}

func (h *S3Handler) CreatePutObjectSignedUrl(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(POST) CreatePutObjectSignedUrl => invoked")

	var createPutObjectSignedUrl CreatePutObjectSignedUrlParams

	errRead := ReadAndValidateBody(r, &createPutObjectSignedUrl)
	if errRead != nil {
		http.Error(w, "Invalid Parameters", http.StatusBadRequest)
		return
	}

	request, err := h.s3Service.PutObjectUrl(createPutObjectSignedUrl.Key, 300)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	clog.Logger.Success("(POST) CreatePutObjectSignedUrl => url generated")

	successResponse(w, request)
}
