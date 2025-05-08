package services

import (
	"fmt"
	"net/http"

	clog "github.com/marcotheo/genesis-link/packages/backend/pkg/logger"
)

type MiddlewareService struct {
	cognitoService *CognitoService
}

func InitMiddlewareService(cognitoService *CognitoService) *MiddlewareService {
	return &MiddlewareService{cognitoService}
}

func (m *MiddlewareService) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token, errorAccessToken := r.Cookie("accessToken")

		if errorAccessToken != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Verify the token
		err := m.cognitoService.VerifyToken(token.Value)
		if err != nil {
			clog.Logger.Error(fmt.Sprintf("(AuthMiddleware) => unauthorized :: %s \n", err))
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
