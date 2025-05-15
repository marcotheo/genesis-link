package handler

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	"github.com/marcotheo/genesis-link/packages/backend/pkg/db"
	clog "github.com/marcotheo/genesis-link/packages/backend/pkg/logger"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/services"
	gonanoid "github.com/matoous/go-nanoid/v2"
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
	CreatedAt    int64  `json:"createdAt"`
	UpdatedAt    int64  `json:"updatedAt"`
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
		CreatedAt:    h.utilService.ConvertNullTime(user.CreatedAt),
		UpdatedAt:    h.utilService.ConvertNullTime(user.UpdatedAt),
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
		clog.Logger.Error(fmt.Sprintf("(POST) UpdateUserInfo => Validation error %s", err))
	} else {
		clog.Logger.Info("(POST) UpdateUserInfo => Validation successful")
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

type SkillParams struct {
	SkillName     string `json:"skillName" validate:"required"`
	SkillLevel    string `json:"skillLevel" validate:"omitempty,oneof=beginner intermediate advanced"` // Optional, must be one of the valid levels if present
	SkillCategory string `json:"skillCategory" validate:"omitempty"`
}

type CreateUserSkillsParams struct {
	Skills []SkillParams `json:"skills" validate:"required,dive"`
}

func (h *UserHandler) CreateUserSkills(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(POST) CreateUserSkills => invoked")

	// Parse and validate the request body
	var params CreateUserSkillsParams
	if err := ReadAndValidateBody(r, &params); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Retrieve the access token and validate it
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

	// Begin a database transaction for multi-row insert
	tx, err := h.dataService.Conn.Begin()
	if err != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreateUserSkills => error beginning transaction: %s", err))
		errorResponse(w, http.StatusInternalServerError, "Something Went Wrong")
		return
	}

	defer tx.Rollback()

	qtx := h.dataService.Queries.WithTx(tx)

	var skillsResponse []Skill

	// Insert each skill for the user
	for _, skill := range params.Skills {
		skillId, err := gonanoid.New()
		if err != nil {
			clog.Logger.Error(fmt.Sprintf("(POST) CreateUserSkills => Error generating skillId: %s", err))
			http.Error(w, "Something Went Wrong", http.StatusInternalServerError)
			return
		}

		// Insert the skill into the database
		if err := qtx.CreateUserSkill(context.Background(), db.CreateUserSkillParams{
			Skillid:       skillId,
			Userid:        userId,
			Skillname:     skill.SkillName,
			Skilllevel:    h.utilService.StringToNullString(skill.SkillLevel),
			Skillcategory: h.utilService.StringToNullString(skill.SkillCategory),
		}); err != nil {
			clog.Logger.Error(fmt.Sprintf("(POST) CreateUserSkills => err %s", err))
			http.Error(w, "Error inserting skill data", http.StatusInternalServerError)
			return
		}

		skillsResponse = append(skillsResponse, Skill{
			SkillID:       skillId,
			SkillName:     skill.SkillName,
			SkillLevel:    skill.SkillLevel,
			SkillCategory: skill.SkillCategory,
		})

	}

	// Commit the transaction
	if err = tx.Commit(); err != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreateUserSkills => err %s", err))
		http.Error(w, "Error committing transaction", http.StatusInternalServerError)
		return
	}

	clog.Logger.Success("(POST) CreateUserSkills => create successful")

	successResponse(w, GetUserSkillsResponse{Skills: skillsResponse})
}

type Skill struct {
	SkillID       string `json:"skillId"`
	SkillName     string `json:"skillName"`
	SkillLevel    string `json:"skillLevel,omitempty"`
	SkillCategory string `json:"skillCategory,omitempty"`
}

type GetUserSkillsResponse struct {
	Skills []Skill `json:"skills"`
}

func (h *UserHandler) GetUserSkills(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(GET) GetUserSkills => invoked")

	// Validate access token and retrieve user ID
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

	userSkills, errQ := h.dataService.Queries.GetUserSkillsByUserId(context.Background(), userId)
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(GET) GetUserSkills => errQ %s \n", errQ))
		http.Error(w, "Error fetching user skills", http.StatusInternalServerError)
		return
	}

	// Map skills to response format
	var skillsData []Skill
	for _, skill := range userSkills {
		item := Skill{
			SkillID:       skill.Skillid,
			SkillName:     skill.Skillname,
			SkillLevel:    h.utilService.ConvertNullString(skill.Skilllevel),
			SkillCategory: h.utilService.ConvertNullString(skill.Skillcategory),
		}
		skillsData = append(skillsData, item)
	}

	clog.Logger.Success("(GET) GetUserSkills => successful")

	// Return skills response
	successResponse(w, GetUserSkillsResponse{Skills: skillsData})
}
