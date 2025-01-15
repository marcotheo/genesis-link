package routes

import (
	handler "github.com/marcotheo/genesis-link/packages/backend/pkg/api/handlers"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/services"
	"github.com/marcotheo/justarouter"
)

type S3Routes struct {
	handlers          *handler.S3Handler
	middlewareService *services.MiddlewareService
}

func InitS3Routes(handlers *handler.S3Handler, middlewareService *services.MiddlewareService) *S3Routes {
	return &S3Routes{
		handlers,
		middlewareService,
	}
}

func (o *S3Routes) Routes() func(subRouter justarouter.SubRouter) {
	return func(subRouter justarouter.SubRouter) {
		subRouter.Use(o.middlewareService.CSRFMiddleware)
		subRouter.Use(o.middlewareService.AuthMiddleware)

		subRouter.POST("/url/put", o.handlers.CreatePutObjectSignedUrl)
	}
}
