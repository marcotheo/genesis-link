package routes

import (
	handler "github.com/marcotheo/genesis-link/packages/backend/pkg/api/handlers"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/services"
	"github.com/marcotheo/justarouter"
)

type ApplicationRoutes struct {
	handlers          *handler.ApplicationHandler
	middlewareService *services.MiddlewareService
}

func InitApplicationRoutes(handlers *handler.ApplicationHandler, middlewareService *services.MiddlewareService) *ApplicationRoutes {
	return &ApplicationRoutes{
		handlers,
		middlewareService,
	}
}

func (o *ApplicationRoutes) Routes() func(subRouter justarouter.SubRouter) {
	return func(subRouter justarouter.SubRouter) {
		subRouter.Use(o.middlewareService.CSRFMiddleware)
		subRouter.Use(o.middlewareService.AuthMiddleware)

		subRouter.POST("", o.handlers.CreateApplication)
		subRouter.GET("", o.handlers.GetApplicationsByUserId)
	}
}
