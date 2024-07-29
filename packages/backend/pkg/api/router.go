package api

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"github.com/awslabs/aws-lambda-go-api-proxy/httpadapter"
	"github.com/joho/godotenv"
	handler "github.com/marcotheo/genesis-link/packages/backend/pkg/api/handlers"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/api/routes"
	clog "github.com/marcotheo/genesis-link/packages/backend/pkg/logger"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/services"
	"github.com/marcotheo/justarouter"
	"go.uber.org/dig"
)

type HealthCheckResponse struct {
	Message string `json:"message"`
}

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(HEALTH) health check invoked")
	response := HealthCheckResponse{Message: "Service Healthy"}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func InitializeApp() (*http.ServeMux, *sql.DB) {
	router := justarouter.CreateRouter()
	var dbConn *sql.DB

	// Create a new dig container
	container := dig.New()

	// initialize services and handlers
	container.Provide(services.InitUtilService)
	container.Provide(services.InitDataService)
	container.Provide(services.InitAuthService)
	container.Provide(handler.InitUserHandler)

	err := container.Invoke(func(
		dataService *services.DataService,
		userHandler *handler.UserHandler,
	) {
		dbConn = dataService.Conn

		clog.Logger.Info("INITIALIZING ROUTES")

		router.AddSubRoutes("/user", routes.User(userHandler))

		router.GET("/health", healthCheckHandler)

		clog.Logger.Info("ROUTES INITIALIZED")
	})

	if err != nil {
		log.Fatalf("Failed to invoke dependencies: %s\n", err)
	}

	return router.Mux, dbConn
}

func GetLambdaAdapter() (*httpadapter.HandlerAdapterV2, *sql.DB) {
	if err := godotenv.Load(); err != nil {
		clog.Logger.Error("No .env file found")
	}

	mux, dbConn := InitializeApp()

	var adapterLambda *httpadapter.HandlerAdapterV2 = httpadapter.NewV2(mux)

	clog.Logger.Info("ADAPTER INTIALIZED")

	return adapterLambda, dbConn
}
