package api

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
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
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")

	router := justarouter.CreateRouter(justarouter.ServerRouterOptions{
		CORS: justarouter.CorsOptions{
			AllowedOrigins:   strings.Split(allowedOrigins, ","),
			AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowCredentials: true,
			AllowedHeaders:   []string{"Content-Type", "Authorization", "X-CSRF-Token"},
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
	container.Provide(services.InitS3Service)
	container.Provide(services.InitMiddlewareService)
	container.Provide(services.InitOpenAIService)

	container.Provide(handler.InitAuthHandler)
	container.Provide(handler.InitUserHandler)
	container.Provide(handler.InitPostHandler)
	container.Provide(handler.InitApplicationHandler)
	container.Provide(handler.InitS3Handler)
	container.Provide(handler.InitAddressHandler)

	container.Provide(routes.InitAuthRoutes)
	container.Provide(routes.InitUserRoutes)
	container.Provide(routes.InitPostRoutes)
	container.Provide(routes.InitApplicationRoutes)
	container.Provide(routes.InitAddressRoutes)
	container.Provide(routes.InitS3Routes)

	err := container.Invoke(func(
		dataService *services.DataService,
		authRoutes *routes.AuthRoutes,
		userRoutes *routes.UserRoutes,
		postRoutes *routes.PostRoutes,
		applicationRoutes *routes.ApplicationRoutes,
		addressRoutes *routes.AddressRoutes,
		s3Routes *routes.S3Routes,
	) {
		dbConn = dataService.Conn

		clog.Logger.Info("INITIALIZING ROUTES")

		router.AddSubRoutes("/api/v1/address", addressRoutes.Routes())
		router.AddSubRoutes("/api/v1/auth", authRoutes.Routes())
		router.AddSubRoutes("/api/v1/users", userRoutes.Routes())
		router.AddSubRoutes("/api/v1/posts", postRoutes.Routes())
		router.AddSubRoutes("/api/v1/applications", applicationRoutes.Routes())
		router.AddSubRoutes("/api/v1/s3", s3Routes.Routes())

		router.POST("/api/v1/health", healthCheckHandler)

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
