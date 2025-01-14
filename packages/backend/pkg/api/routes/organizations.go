package routes

import (
	handler "github.com/marcotheo/genesis-link/packages/backend/pkg/api/handlers"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/services"
	"github.com/marcotheo/justarouter"
)

type OrgRoutes struct {
	orgHandler        *handler.OrgHandler
	addressHandler    *handler.AddressHandler
	middlewareService *services.MiddlewareService
}

func InitOrgRoutes(orgHandler *handler.OrgHandler, addressHandler *handler.AddressHandler, middlewareService *services.MiddlewareService) *OrgRoutes {
	return &OrgRoutes{
		orgHandler,
		addressHandler,
		middlewareService,
	}
}

func (o *OrgRoutes) Routes() func(subRouter justarouter.SubRouter) {
	return func(subRouter justarouter.SubRouter) {
		subRouter.Use(o.middlewareService.CSRFMiddleware)
		subRouter.Use(o.middlewareService.AuthMiddleware)

		subRouter.POST("/create", o.orgHandler.CreateOrg)

		// org/address routes
		subRouter.POST("/{orgId}/addresses", o.addressHandler.CreateAddress)
		subRouter.GET("/{orgId}/address", o.addressHandler.GetAddressesByOrgId)
		subRouter.DELETE("/{orgId}/address/{addressId}", o.addressHandler.DeleteAddressById)
	}
}
