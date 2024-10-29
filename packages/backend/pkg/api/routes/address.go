package routes

import (
	handler "github.com/marcotheo/genesis-link/packages/backend/pkg/api/handlers"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/services"
	"github.com/marcotheo/justarouter"
)

type AddressRoutes struct {
	handlers          *handler.AddressHandler
	middlewareService *services.MiddlewareService
}

func InitAddressRoutes(handlers *handler.AddressHandler, middlewareService *services.MiddlewareService) *AddressRoutes {
	return &AddressRoutes{
		handlers,
		middlewareService,
	}
}

func (o *AddressRoutes) Routes() func(subRouter justarouter.SubRouter) {
	return func(subRouter justarouter.SubRouter) {
		subRouter.Use(o.middlewareService.AuthMiddleware)
		subRouter.POST("/create", o.handlers.CreateAddress)
		subRouter.GET("/", o.handlers.GetAddressesByUserId)
	}
}
