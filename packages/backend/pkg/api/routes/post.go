package routes

import (
	handler "github.com/marcotheo/genesis-link/packages/backend/pkg/api/handlers"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/services"
	"github.com/marcotheo/justarouter"
)

type PostRoutes struct {
	handlers          *handler.PostHandler
	middlewareService *services.MiddlewareService
}

func InitPostRoutes(handlers *handler.PostHandler, middlewareService *services.MiddlewareService) *PostRoutes {
	return &PostRoutes{
		handlers,
		middlewareService,
	}
}

func (o *PostRoutes) Routes() func(subRouter justarouter.SubRouter) {
	return func(subRouter justarouter.SubRouter) {
		subRouter.Use(o.middlewareService.CSRFMiddleware)
		subRouter.Use(o.middlewareService.AuthMiddleware)

		subRouter.POST("/search/jobs", o.handlers.SearchJob)
		subRouter.GET("/{postId}", o.handlers.GetPostDetails)

		subRouter.POST("/{postId}/save", o.handlers.CreateSavedPost)
		subRouter.GET("/{postId}/save", o.handlers.GetUserSavedPost)
	}
}
