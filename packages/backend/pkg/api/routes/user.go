package routes

import (
	handler "github.com/marcotheo/genesis-fleet/packages/backend/pkg/api/handlers"
	"github.com/marcotheo/justarouter"
)

func User(h *handler.UserHandler) func(subRouter justarouter.SubRouter) {
	return func(subRouter justarouter.SubRouter) {
		subRouter.POST("/create", h.CreateUser)
		subRouter.GET("/{userId}", h.GetUser)
		subRouter.POST("/signin", h.SignInUser)
	}
}
