package api

import (
	"fmt"
	"log"
	"net/http"

	"github.com/joho/godotenv"
	handler "github.com/marcotheo/genesis-fleet/packages/backend/pkg/api/handlers"
	routes "github.com/marcotheo/genesis-fleet/packages/backend/pkg/api/routes"
	clog "github.com/marcotheo/genesis-fleet/packages/backend/pkg/logger"
	"github.com/marcotheo/genesis-fleet/packages/backend/pkg/services"
	"github.com/marcotheo/justarouter"
	"go.uber.org/dig"
)

func Handler() {
	if err := godotenv.Load(); err != nil {
		clog.Logger.Error("No .env file found")
		return
	}

	// Create a new dig container
	container := dig.New()

	// initialize services and handlers
	container.Provide(services.InitDataService)
	container.Provide(services.InitCognitoService)
	container.Provide(handler.InitUserHandler)

	err := container.Invoke(func(
		dataService *services.DataService,
		userHandler *handler.UserHandler,
	) {
		defer dataService.Conn.Close()

		router := justarouter.CreateRouter()

		router.AddSubRoutes("/user", routes.User(userHandler))

		router.GET("/health", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			fmt.Fprint(w, "App is Healthy")
		})

		server := http.Server{
			Addr:    ":8080",
			Handler: router.Mux,
		}

		clog.Logger.Info("Starting server on :8080")

		err := server.ListenAndServe()

		if err != nil {
			log.Fatal(err)
		}
	})

	if err != nil {
		log.Fatalf("Failed to invoke dependencies: %s\n", err)
	}
}
