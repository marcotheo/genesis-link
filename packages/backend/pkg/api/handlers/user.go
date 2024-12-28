package handler

import (
	"context"
	"errors"
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

type UserDetailsAPI struct {
	Userid       string `json:"userId"`
	Email        string `json:"email"`
	Mobilenumber string `json:"mobileNumber"`
	Resumelink   string `json:"resumeLink"`
	CreatedAt    string `json:"createdAt"`
	UpdatedAt    string `json:"updatedAt"`
}

func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(USER) GetUser => invoked")

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

	user, err := h.dataService.Queries.GetUser(context.Background(), userId)

	if err != nil {
		fmt.Printf("err %s \n", err)
		clog.Logger.Error(fmt.Sprintf("(USER) GetUser => error in query get user = (%s) \n", err))
		errorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	if user.Userid == "" {
		clog.Logger.Error("(USER) GetUser => user does not exist")
		errorResponse(w, http.StatusBadRequest, "User does not exist!")
		return
	}

	clog.Logger.Success("(USER) GetUser => details successfuly retrieved")

	successResponse(w, UserDetailsAPI{
		Userid:       user.Userid,
		Email:        user.Email,
		Mobilenumber: h.utilService.ConvertNullString(user.Mobilenumber),
		Resumelink:   h.utilService.ConvertNullString(user.Resumelink),
		CreatedAt:    h.utilService.HandleInterfaceToString(user.CreatedAt),
		UpdatedAt:    h.utilService.HandleInterfaceToString(user.UpdatedAt),
	})
}

type UpdateUserInfoParams struct {
	ResumeLink   string `json:"resumeLink"`
	MobileNumber string `json:"mobileNumber"`
	Email        string `json:"email"`
}

// Validate checks if at least one field is not empty.
func (u *UpdateUserInfoParams) Validate() error {
	if u.ResumeLink == "" && u.MobileNumber == "" && u.Email == "" {
		return errors.New("no update field provided")
	}
	return nil
}

func (h *UserHandler) UpdateUserInfo(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(POST) UpdateUserInfo => invoked")

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

	var params UpdateUserInfoParams

	errRead := ReadAndValidateBody(r, &params)
	if errRead != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) UpdateUserInfo => ReadAndValidateBody %s", errRead))
		http.Error(w, errRead.Error(), http.StatusBadRequest)
		return
	}

	if err := params.Validate(); err != nil {
		fmt.Println("Validation error:", err)
	} else {
		fmt.Println("Validation successful")
	}

	if params.ResumeLink != "" {
		err := h.dataService.Queries.UpdateResumeLink(context.Background(), db.UpdateResumeLinkParams{
			Userid:     userId,
			Resumelink: h.utilService.StringToNullString(params.ResumeLink),
		})

		if err != nil {
			clog.Logger.Error(fmt.Sprintf("(POST) UpdateUserInfo => ResumeLink err %s \n", err))
			http.Error(w, "Something Went Wrong", http.StatusInternalServerError)
			return
		}
	}

	if params.MobileNumber != "" {
		err := h.dataService.Queries.UpdateMobileNumber(context.Background(), db.UpdateMobileNumberParams{
			Userid:       userId,
			Mobilenumber: h.utilService.StringToNullString(params.MobileNumber),
		})

		if err != nil {
			clog.Logger.Error(fmt.Sprintf("(POST) UpdateUserInfo => MobileNumber err %s \n", err))
			http.Error(w, "Something Went Wrong", http.StatusInternalServerError)
			return
		}
	}

	if params.Email != "" {
		err := h.dataService.Queries.UpdateEmail(context.Background(), db.UpdateEmailParams{
			Userid: userId,
			Email:  params.Email,
		})

		if err != nil {
			clog.Logger.Error(fmt.Sprintf("(POST) UpdateUserInfo => Email err %s \n", err))
			http.Error(w, "Something Went Wrong", http.StatusInternalServerError)
			return
		}
	}

	clog.Logger.Success("(POST) UpdateUserInfo => update successful")

	w.WriteHeader(http.StatusNoContent)
}
