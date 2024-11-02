package routes

import (
	handler "github.com/marcotheo/genesis-link/packages/backend/pkg/api/handlers"
	"github.com/marcotheo/justarouter"
)

type UserRoutes struct {
	handlers *handler.UserHandler
}

func InitUserRoutes(handlers *handler.UserHandler) *UserRoutes {
	return &UserRoutes{
		handlers,
	}
}

func (o *UserRoutes) Routes() func(subRouter justarouter.SubRouter) {
	return func(subRouter justarouter.SubRouter) {
		subRouter.POST("/create", o.handlers.CreateUser)
		subRouter.POST("/confirm", o.handlers.ConfirmSignUp)
		subRouter.GET("/{userId}", o.handlers.GetUser)
		subRouter.POST("/signin", o.handlers.SignInUser)
		subRouter.POST("/token/refresh", o.handlers.RefreshAccessToken)
		subRouter.DELETE("/session/revoke", o.handlers.RevokeRefreshToken)
	}
}
