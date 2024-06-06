package main

import (
	"fmt"
	"net/http"

	"github.com/marcotheo/genesis-fleet/packages/backend/pkg/api"
)

func main() {
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
