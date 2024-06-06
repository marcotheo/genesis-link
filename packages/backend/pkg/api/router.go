package api

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/marcotheo/genesis-fleet/packages/backend/pkg/db"
	"github.com/marcotheo/genesis-fleet/packages/backend/pkg/repository"
	"github.com/marcotheo/justarouter"
)

func dbinit() *repository.Queries {
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

	queries := repository.New(db)

	return queries
}

func Routes() *http.ServeMux {
	queries := dbinit()

	// services
	
	// handlers
	
    router := justarouter.CreateRouter()

	router.GET("/health", func(w http.ResponseWriter, r *http.Request,) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, "App is Healthy")
	});

	return router.Mux
}
