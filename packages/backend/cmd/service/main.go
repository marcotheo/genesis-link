package main

import (
	"github.com/marcotheo/genesis-fleet/packages/backend/pkg/api"
	_ "github.com/tursodatabase/libsql-client-go/libsql"
)

func main() {
	api.Handler()
}
