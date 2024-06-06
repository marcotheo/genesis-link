package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/marcotheo/genesis-fleet/packages/backend/pkg/api"
	"github.com/marcotheo/genesis-fleet/packages/backend/pkg/db"
)

func main() {
	if err := godotenv.Load(); err != nil {
        log.Println("No .env file found")
    }

	db.Init()
	
    router := api.Routes()

	server := http.Server{
		Addr:    ":8080",
		Handler: router,
	}

	fmt.Println("Server running at port :8080")

	err := server.ListenAndServe()

	if err != nil {
		fmt.Println(err)
		return
	}
}
