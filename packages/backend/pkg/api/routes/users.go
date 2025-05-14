package routes

import (
	handler "github.com/marcotheo/genesis-link/packages/backend/pkg/api/handlers"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/services"
	"github.com/marcotheo/justarouter"
)

type UserRoutes struct {
	userHandler       *handler.UserHandler
	postHandler       *handler.PostHandler
	middlewareService *services.MiddlewareService
}

func InitUserRoutes(userHandler *handler.UserHandler, postHandler *handler.PostHandler, middlewareService *services.MiddlewareService) *UserRoutes {
	return &UserRoutes{
		userHandler,
		postHandler,
		middlewareService,
	}
}

func (o *UserRoutes) Routes() func(subRouter justarouter.SubRouter) {
	return func(subRouter justarouter.SubRouter) {
		subRouter.Use(o.middlewareService.CSRFMiddleware)
		subRouter.Use(o.middlewareService.AuthMiddleware)

		subRouter.PUT("/update/info", o.userHandler.UpdateUserInfo)
		subRouter.GET("/account/details", o.userHandler.GetUser)

		subRouter.POST("/skills", o.userHandler.CreateUserSkills)
		subRouter.GET("/skills", o.userHandler.GetUserSkills)

		subRouter.GET("/saved-posts", o.postHandler.GetSavedPostsByUserId)
	}
}
