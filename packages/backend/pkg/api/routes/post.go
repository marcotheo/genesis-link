package routes

import (
	handler "github.com/marcotheo/genesis-link/packages/backend/pkg/api/handlers"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/services"
	"github.com/marcotheo/justarouter"
)

type PostRoutes struct {
	postHandler        *handler.PostHandler
	applicationHandler *handler.ApplicationHandler
	middlewareService  *services.MiddlewareService
}

func InitPostRoutes(postHandlers *handler.PostHandler, applicationHandler *handler.ApplicationHandler, middlewareService *services.MiddlewareService) *PostRoutes {
	return &PostRoutes{
		postHandlers,
		applicationHandler,
		middlewareService,
	}
}

func (o *PostRoutes) Routes() func(subRouter justarouter.SubRouter) {
	return func(subRouter justarouter.SubRouter) {
		subRouter.Use(o.middlewareService.CSRFMiddleware)
		subRouter.Use(o.middlewareService.AuthMiddleware)

		subRouter.GET("/search/jobs", o.postHandler.SearchJob)
		subRouter.GET("/{postId}", o.postHandler.GetPostDetails)
		subRouter.GET("/{postId}/applications", o.applicationHandler.GetApplicationsByPostId)

		subRouter.POST("/{postId}/save", o.postHandler.CreateSavedPost)
		subRouter.GET("/{postId}/save", o.postHandler.GetUserSavedPost)
		subRouter.DELETE("/{postId}/save", o.postHandler.DeleteSavedPost)
	}
}
