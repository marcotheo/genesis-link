package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/awslabs/aws-lambda-go-api-proxy/httpadapter"
	"github.com/joho/godotenv"
	clog "github.com/marcotheo/genesis-fleet/packages/backend/pkg/logger"
	"github.com/marcotheo/justarouter"
	"go.uber.org/dig"
)

type HealthCheckResponse struct {
	Message string `json:"message"`
}

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	response := HealthCheckResponse{Message: "Service Healthy"}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func GetLambdaAdapter() *httpadapter.HandlerAdapterV2 {
	if err := godotenv.Load(); err != nil {
		clog.Logger.Error("No .env file found")
	}

	var adapterLambda *httpadapter.HandlerAdapterV2

	// Create a new dig container
	container := dig.New()

	// initialize services and handlers
	// container.Provide(services.InitDataService)
	// container.Provide(services.InitCognitoService)
	// container.Provide(handler.InitUserHandler)

	err := container.Invoke(func(
	// dataService *services.DataService,
	// userHandler *handler.UserHandler,
	) {
		// defer dataService.Conn.Close()

		clog.Logger.Info("INITIALIZING ROUTES")

		router := justarouter.CreateRouter()

		// router.AddSubRoutes("/user", routes.User(userHandler))

		router.GET("/health", healthCheckHandler)

		clog.Logger.Info("HERE REACHED2")

		adapterLambda = httpadapter.NewV2(router.Mux)

		clog.Logger.Info("ROUTES INITIALIZED")
	})
	
	if err != nil {
		log.Fatalf("Failed to invoke dependencies: %s\n", err)
	}

	clog.Logger.Info("ADAPTER INTIALIZED")

	return adapterLambda
}
