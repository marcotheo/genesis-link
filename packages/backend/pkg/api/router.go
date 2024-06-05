// pkg/api/router.go
package api

import (
	"fmt"
	"net/http"

	"github.com/marcotheo/justarouter"
)

func Routes() *http.ServeMux {
    router := justarouter.CreateRouter()

	router.GET("/health", func(w http.ResponseWriter, r *http.Request,) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, "App is Healthy")
	});

	return router.Mux
}
