package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/marcotheo/genesis-fleet/packages/backend/pkg/api"
	"github.com/marcotheo/genesis-fleet/packages/backend/pkg/db"
)

func main() {
	if err := godotenv.Load(); err != nil {
        log.Println("No .env file found")
    }

	db, errdb := db.Init()

	if errdb != nil {
		fmt.Fprintf(os.Stderr, "failed to open db %s", errdb)
		os.Exit(1)
	  }
  
	fmt.Println("Tursodb connection successful")

	defer db.Close()
	
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
