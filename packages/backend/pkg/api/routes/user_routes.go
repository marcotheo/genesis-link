package routes

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/marcotheo/genesis-fleet/packages/backend/pkg/db"
	clog "github.com/marcotheo/genesis-fleet/packages/backend/pkg/logger"
	"github.com/marcotheo/justarouter"
)

type CreateUserParamsValidation struct {
	Firstname string `json:"first_name" validate:"required"`
	Lastname  string `json:"last_name" validate:"required"`
	Email     string `json:"email" validate:"required,email"`
}

func User(q *db.Queries) func(subRouter justarouter.SubRouter) {
	userRoutes := func(subRouter justarouter.SubRouter) {
		subRouter.POST("/create", func(w http.ResponseWriter, r *http.Request) {
			clog.Logger.Info("(USER) createUser => creating new user")

			var userValidation CreateUserParamsValidation

			errRead := ReadAndValidateBody(r, &userValidation)
			if errRead != nil {
				http.Error(w, errRead.Error(), http.StatusBadRequest)
				return
			}

			// pass to validated data to actual db params
			var userData db.CreateUserParams
			errCopier := copier.Copy(&userData, &userValidation)
			if errCopier != nil {
				clog.Logger.Error(fmt.Sprintf("(USER) createUser => Error copying: %s", errCopier))
				errorResponse(w, http.StatusInternalServerError, "Something Went Wrong")
				return
			}

			userData.Userid = uuid.New().String()

			user, errQ := q.CreateUser(context.Background(), userData)
			if errQ != nil {
				clog.Logger.Error(fmt.Sprintf("(USER) createUser => errQ %s \n", errQ))
				http.Error(w, "Error creating response", http.StatusInternalServerError)
				return
			}

			response, errMarshal := json.Marshal(user)
			if errMarshal != nil {
				clog.Logger.Error(fmt.Sprintf("(USER) createUser => error in json.marshal %s \n", errMarshal))
				http.Error(w, "Error creating response", http.StatusInternalServerError)
				return
			}

			clog.Logger.Success("(USER) createUser => create successful")

			w.Header().Set("Content-Type", "application/json")
			w.Write(response)
		})

		subRouter.GET("/{userId}", func(w http.ResponseWriter, r *http.Request) {
			clog.Logger.Info("(USER) getDetails => get details")

			userId := r.PathValue("userId")

			user, err := q.GetUser(context.Background(), userId)

			if user.Userid == nil {
				clog.Logger.Error("(USER) getDetails => user does not exist")
				errorResponse(w, http.StatusBadRequest, "User does not exist!")
				return
			}

			if err != nil {
				fmt.Printf("err %s \n", err)
				clog.Logger.Error(fmt.Sprintf("(USER) getDetails => error in query get user = (%s) \n", err))
				errorResponse(w, http.StatusInternalServerError, err.Error())
				return
			}

			clog.Logger.Success("(USER) getDetails => details successfuly retrieved")

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(Response{Status: "success", Data: user})
		})
	}

	return userRoutes
}
