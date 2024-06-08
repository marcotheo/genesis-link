package userapi

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/google/uuid"
	"github.com/marcotheo/genesis-fleet/packages/backend/pkg/db"
	"github.com/marcotheo/justarouter"
)

type Response struct {
    Status  string `json:"status"`
    Message string `json:"message"`
    Data    any    `json:"data,omitempty"`
}

func Routes(queries *db.Queries) func(subRouter justarouter.SubRouter) {
	fmt.Println("running sub routes")

	userRoutes :=  func(subRouter justarouter.SubRouter) {
		subRouter.POST("/create", func(w http.ResponseWriter, r *http.Request,) {
			fmt.Println("USER :: CREATE")
			
			body, err := io.ReadAll(r.Body)
			if err != nil {
				http.Error(w, "Unable to read body", http.StatusBadRequest)
				return
			}
			defer r.Body.Close()

			var userData db.CreateUserParams

			err = json.Unmarshal(body, &userData)
			if err != nil {
				http.Error(w, "Invalid JSON", http.StatusBadRequest)
				return
			}

			userData.Userid = uuid.New().String()

			user, err := queries.CreateUser(context.Background(), userData)
			if err != nil {
				fmt.Printf("err %s \n", err)
			}

			response, err := json.Marshal(user)
			if  err != nil {
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

			user, err := queries.GetUser(context.Background(), userId)

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