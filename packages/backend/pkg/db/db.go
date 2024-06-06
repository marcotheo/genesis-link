package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/tursodatabase/libsql-client-go/libsql"
)

func Init() {
	dbName := os.Getenv("DB_NAME")
	dbToken := os.Getenv("DB_TOKEN")

	if dbName == "" || dbToken == "" {
        log.Fatal("DATABASE and TOKEN environment variables are required")
    }


	url := fmt.Sprintf("libsql://%s.turso.io?authToken=%s", dbName, dbToken)

	db, err := sql.Open("libsql", url)

	if err != nil {
	  fmt.Fprintf(os.Stderr, "failed to open db %s: %s", url, err)
	  os.Exit(1)
	}

	fmt.Println("Tursodb connection successful")

	defer db.Close()
}