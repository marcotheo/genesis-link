package main

import (
	"fmt"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/marcotheo/genesis-fleet/packages/backend/pkg/api"
	clog "github.com/marcotheo/genesis-fleet/packages/backend/pkg/logger"
)

func main() {
	if err := godotenv.Load(); err != nil {
		fmt.Println("No .env file found")
	}

	router, dbConn := api.InitializeApp()

	defer dbConn.Close()

	server := http.Server{
		Addr:    ":3000",
		Handler: router,
	}

	clog.Logger.Info("Server running at port :3000")

	err := server.ListenAndServe()

	if err != nil {
		fmt.Println(err)
		return
	}
}