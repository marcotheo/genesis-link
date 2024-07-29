package services

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/marcotheo/genesis-link/packages/backend/pkg/db"
	clog "github.com/marcotheo/genesis-link/packages/backend/pkg/logger"
	_ "github.com/tursodatabase/libsql-client-go/libsql"
)

type DataService struct {
	Queries *db.Queries
	Conn    *sql.DB
}

func InitDataService() *DataService {
	dbUrl := os.Getenv("DB_URL")

	if dbUrl == "" {
		log.Fatal("DATABASE URL environment variable is required")
	}

	conn, errdb := sql.Open("libsql", dbUrl)

	if errdb != nil {
		fmt.Fprintf(os.Stderr, "failed to open db %s", errdb)
		os.Exit(1)
	}

	clog.Logger.GreenPrefix("TURSO", "db connection successful")

	queries := db.New(conn)

	return &DataService{
		Queries: queries,
		Conn:    conn,
	}
}
