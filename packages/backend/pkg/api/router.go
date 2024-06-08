package api

import (
	"fmt"
	"net/http"

	routes "github.com/marcotheo/genesis-fleet/packages/backend/pkg/api/routes"
	"github.com/marcotheo/genesis-fleet/packages/backend/pkg/db"
	"github.com/marcotheo/justarouter"
)


func Routes(queries *db.Queries) *http.ServeMux {
    router := justarouter.CreateRouter()

	router.AddSubRoutes("/user", routes.User(queries))

	router.GET("/health", func(w http.ResponseWriter, r *http.Request,) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, "App is Healthy")
	});

	return router.Mux
}
