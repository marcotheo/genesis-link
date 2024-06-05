package main

import (
	"fmt"
	"net/http"

	"github.com/marcotheo/justarouter"
)

func main() {
    router := justarouter.CreateRouter()

	router.GET("/health", func(w http.ResponseWriter, r *http.Request,) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, "App is Healthy")
	});

	server := http.Server{
		Addr:    ":8080",
		Handler: router.Mux,
	}

	fmt.Println("Server running at port :8080")

	err := server.ListenAndServe()

	if err != nil {
		fmt.Println(err)
		return
	}

}
