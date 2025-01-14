package routes

import (
	handler "github.com/marcotheo/genesis-link/packages/backend/pkg/api/handlers"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/services"
	"github.com/marcotheo/justarouter"
)

type OrgRoutes struct {
	handlers          *handler.OrgHandler
	middlewareService *services.MiddlewareService
}

func InitOrgRoutes(handlers *handler.OrgHandler, middlewareService *services.MiddlewareService) *OrgRoutes {
	return &OrgRoutes{
		handlers,
		middlewareService,
	}
}

func (o *OrgRoutes) Routes() func(subRouter justarouter.SubRouter) {
	return func(subRouter justarouter.SubRouter) {
		subRouter.Use(o.middlewareService.CSRFMiddleware)
		subRouter.Use(o.middlewareService.AuthMiddleware)

		subRouter.POST("/create", o.handlers.CreateOrg)
	}
}
