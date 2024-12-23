package routes

import (
	handler "github.com/marcotheo/genesis-link/packages/backend/pkg/api/handlers"
	"github.com/marcotheo/justarouter"
)

type AuthRoutes struct {
	handlers *handler.AuthHandler
}

func InitAuthRoutes(handlers *handler.AuthHandler) *AuthRoutes {
	return &AuthRoutes{
		handlers,
	}
}

func (o *AuthRoutes) Routes() func(subRouter justarouter.SubRouter) {
	return func(subRouter justarouter.SubRouter) {
		subRouter.POST("/register", o.handlers.CreateUser)
		subRouter.POST("/confirm", o.handlers.ConfirmSignUp)
		subRouter.POST("/signin", o.handlers.SignInUser)
		subRouter.POST("/token/refresh", o.handlers.RefreshAccessToken)
		subRouter.DELETE("/session/revoke", o.handlers.RevokeRefreshToken)
	}
}
