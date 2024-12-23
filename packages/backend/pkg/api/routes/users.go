package routes

import (
	handler "github.com/marcotheo/genesis-link/packages/backend/pkg/api/handlers"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/services"
	"github.com/marcotheo/justarouter"
)

type UserRoutes struct {
	handlers          *handler.UserHandler
	middlewareService *services.MiddlewareService
}

func InitUserRoutes(handlers *handler.UserHandler, middlewareService *services.MiddlewareService) *UserRoutes {
	return &UserRoutes{
		handlers,
		middlewareService,
	}
}

func (o *UserRoutes) Routes() func(subRouter justarouter.SubRouter) {
	return func(subRouter justarouter.SubRouter) {
		subRouter.Use(o.middlewareService.CSRFMiddleware)
		subRouter.Use(o.middlewareService.AuthMiddleware)

		subRouter.POST("/create", o.handlers.UpdateResumeLink)
		subRouter.GET("/{userId}", o.handlers.GetUser)
	}
}
