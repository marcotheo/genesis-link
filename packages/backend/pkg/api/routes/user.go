package userapi

import (
	"context"
	"fmt"
	"net/http"

	"github.com/marcotheo/genesis-fleet/packages/backend/pkg/db"
	"github.com/marcotheo/justarouter"
)

func Routes(queries *db.Queries) func(subRouter justarouter.SubRouter) {
	fmt.Println("running sub routes")

	userRoutes :=  func(subRouter justarouter.SubRouter) {
		subRouter.GET("/health", func(w http.ResponseWriter, r *http.Request,) {
			fmt.Println("CREATING USER")

			user, err := queries.CreateUser(context.Background(), db.CreateUserParams{
				Userid: "434343434",
				Firstname: "Diane",
				Lastname: "Butalid",
				Email: "marcobutalid@gmail.com",
			})

			fmt.Println("CREATING USER", user)

			if err != nil {
				fmt.Println("err %s", err)
			}

			w.WriteHeader(http.StatusOK)
			fmt.Fprint(w, "App is Healthy Marco")
		})
	}

	return userRoutes
}