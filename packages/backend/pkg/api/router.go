package api

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
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
	fmt.Println("HELLO WORLDS")
	response := HealthCheckResponse{Message: "App is Healthysss"}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func Handler() {
	if err := godotenv.Load(); err != nil {
		clog.Logger.Error("No .env file found")
		return
	}

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

		router := justarouter.CreateRouter()

		// router.AddSubRoutes("/user", routes.User(userHandler))

		router.GET("/health", healthCheckHandler)

		deployment := os.Getenv("GO_DEPLOMENT")

		if deployment == "server" {
			server := http.Server{
				Addr:    ":3000",
				Handler: router.Mux,
			}

			clog.Logger.Info("Starting server on :3000")

			err := server.ListenAndServe()

			if err != nil {
				log.Fatal(err)
			}
		} else {
			adapter := httpadapter.New(router.Mux)
			lambda.Start(adapter.ProxyWithContext)
		}

	})

	if err != nil {
		log.Fatalf("Failed to invoke dependencies: %s\n", err)
	}
}
