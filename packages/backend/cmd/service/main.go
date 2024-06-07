package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/marcotheo/genesis-fleet/packages/backend/pkg/api"
	"github.com/marcotheo/genesis-fleet/packages/backend/pkg/db"
	_ "github.com/tursodatabase/libsql-client-go/libsql"
)
func dbinit() (*db.Queries, *sql.DB) {
	if err := godotenv.Load(); err != nil {
        log.Println("No .env file found")
    }

	dbUrl := os.Getenv("DB_URL")

	if dbUrl == ""{
        log.Fatal("DATABASE URL environment variable is required")
    }

	conn, errdb := sql.Open("libsql", dbUrl)

	if errdb != nil {
		fmt.Fprintf(os.Stderr, "failed to open db %s", errdb)
		os.Exit(1)
	  }
  
	fmt.Println("Tursodb connection successful")

	queries := db.New(conn)

	return queries, conn
}

func main() {
	queries, db := dbinit()

	defer db.Close()
	
    router := api.Routes(queries)

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
