package routes

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/marcotheo/genesis-fleet/packages/backend/pkg/db"
	"github.com/marcotheo/justarouter"
)

type Response struct {
    Status  string `json:"status"`
    Message string `json:"message"`
    Data    any    `json:"data,omitempty"`
}

type CreateUserParamsValidation struct {
    Firstname string `json:"first_name" validate:"required"`
    Lastname  string `json:"last_name" validate:"required"`
    Email     string `json:"email" validate:"required,email"`
}

func User(q *db.Queries) func(subRouter justarouter.SubRouter) {
	userRoutes :=  func(subRouter justarouter.SubRouter) {
		subRouter.POST("/create", func(w http.ResponseWriter, r *http.Request,) {
			fmt.Println("USER :: CREATE")

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
				fmt.Println("Error copying:", errCopier)
				return
			}

			userData.Userid = uuid.New().String()

			user, errQ := q.CreateUser(context.Background(), userData)
			if errQ != nil {
				fmt.Printf("errQ %s \n", errQ)
			}

			response, errMarshal := json.Marshal(user)
			if  errMarshal != nil {
				http.Error(w, "Error creating response", http.StatusInternalServerError)
            	return
			}

			fmt.Println("USER :: CREATE SUCCESSFUL")

			w.Header().Set("Content-Type", "application/json")
			w.Write(response)
		})

		subRouter.GET("/{userId}", func(w http.ResponseWriter, r *http.Request,) {
			fmt.Println("USER :: GET DETAILS")

			userId := r.PathValue("userId")

			user, err := q.GetUser(context.Background(), userId)

			if err != nil {
				fmt.Printf("err %s \n", err)
			}

			fmt.Println("USER :: GET DETAILS SUCCESSFUL")

			w.Header().Set("Content-Type", "application/json")
        	json.NewEncoder(w).Encode(Response{Status: "success", Data: user})
		})
	}

	return userRoutes
}