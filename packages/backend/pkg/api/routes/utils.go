package routes

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/go-playground/validator/v10"
)

type Response struct {
    Status  string `json:"status"`
    Message string `json:"message"`
    Data    any    `json:"data,omitempty"`
}

type ErrorResponse struct {
    Message string `json:"message"`
}

func ReadAndValidateBody(r *http.Request, v interface{}) error {
    // Read the request body
    body, err := io.ReadAll(r.Body)
    if err != nil {
        return fmt.Errorf("unable to read body: %w", err)
    }
    defer r.Body.Close()

    // Unmarshal the JSON data into the provided struct
    err = json.Unmarshal(body, v)
    if err != nil {
        return fmt.Errorf("invalid JSON: %w", err)
    }

    // Validate the struct
    validate := validator.New()
    err = validate.Struct(v)
    if err != nil {
        return fmt.Errorf("validation failed: %w", err)
    }

    return nil
}

func errorResponse(w http.ResponseWriter, statusCode int, message string) {
    w.WriteHeader(statusCode)
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(ErrorResponse{Message: message})
}
