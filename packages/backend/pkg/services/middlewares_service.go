package services

import (
	"context"
	"fmt"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
)

type MiddlewareService struct {
	cognitoService *CognitoService
}

func InitMiddlewareService(cognitoService *CognitoService) *MiddlewareService {
	return &MiddlewareService{cognitoService}
}

// verifyToken verifies the JWT token using Cognito
func verifyToken(client *cognitoidentityprovider.Client, token string) (*cognitoidentityprovider.GetUserInput, error) {
	// The token is used to get the user information
	// This is called to check if AccessToken is valid
	_, err := client.GetUser(context.TODO(), &cognitoidentityprovider.GetUserInput{
		AccessToken: aws.String(token),
	})
	if err != nil {
		return nil, err
	}
	return nil, nil
}

func (m *MiddlewareService) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token, errorAccessToken := r.Cookie("accessToken")
		if errorAccessToken != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Verify the token
		_, err := verifyToken(m.cognitoService.Client, token.Value)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (m *MiddlewareService) CSRFMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" || r.Method == "PUT" || r.Method == "DELETE" {
			csrfTokenCookie, err := r.Cookie("csrfToken")
			if err != nil {
				fmt.Println("Error", err)
				http.Error(w, "No CSRF Token Found", http.StatusBadRequest)
				return
			}

			csrfTokenHeader := r.Header.Get("X-CSRF-Token")

			if csrfTokenHeader != csrfTokenCookie.Value {
				http.Error(w, "Forbidden - CSRF token invalid", http.StatusForbidden)
				return
			}
		}

		next.ServeHTTP(w, r)
	})
}
