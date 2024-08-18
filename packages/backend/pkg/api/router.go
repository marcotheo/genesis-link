package api

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/awslabs/aws-lambda-go-api-proxy/httpadapter"
	"github.com/joho/godotenv"
	handler "github.com/marcotheo/genesis-link/packages/backend/pkg/api/handlers"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/api/routes"
	clog "github.com/marcotheo/genesis-link/packages/backend/pkg/logger"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/services"
	"github.com/marcotheo/justarouter"
	"go.uber.org/dig"
)

func InitializeApp() (*http.Handler, *sql.DB) {
	router := justarouter.CreateRouter(justarouter.ServerRouterOptions{
		CORS: justarouter.CorsOptions{
			AllowedOrigins:   []string{"http://localhost:5173"},
			AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowCredentials: true,
			AllowedHeaders:   []string{"Content-Type", "Authorization"},
			MaxAge:           3600 * time.Second, // 1 hour
		},
	})

	var dbConn *sql.DB

	// Create a new dig container
	container := dig.New()

	// initialize services and handlers
	container.Provide(services.InitUtilService)
	container.Provide(services.InitDataService)
	container.Provide(services.InitCognitoService)
	container.Provide(services.InitMiddlewareService)
	container.Provide(handler.InitUserHandler)
	container.Provide(handler.InitPostHandler)
	container.Provide(routes.InitUserRoutes)
	container.Provide(routes.InitPostRoutes)

	err := container.Invoke(func(
		dataService *services.DataService,
		userRoutes *routes.UserRoutes,
		postRoutes *routes.PostRoutes,
	) {
		dbConn = dataService.Conn

		clog.Logger.Info("INITIALIZING ROUTES")

		router.AddSubRoutes("/api/v1/user", userRoutes.Routes())
		router.AddSubRoutes("/api/v1/post", postRoutes.Routes())

		router.POST("/health", healthCheckHandler)

		clog.Logger.Info("ROUTES INITIALIZED")
	})

	if err != nil {
		log.Fatalf("Failed to invoke dependencies: %s\n", err)
	}

	return router.Handler, dbConn
}

func GetLambdaAdapter() (*httpadapter.HandlerAdapterV2, *sql.DB) {
	if err := godotenv.Load(); err != nil {
		clog.Logger.Error("No .env file found")
	}

	handler, dbConn := InitializeApp()

	var adapterLambda *httpadapter.HandlerAdapterV2 = httpadapter.NewV2(*handler)

	clog.Logger.Info("ADAPTER INTIALIZED")

	return adapterLambda, dbConn
}

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
