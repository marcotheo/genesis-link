package routes

import (
	handler "github.com/marcotheo/genesis-link/packages/backend/pkg/api/handlers"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/services"
	"github.com/marcotheo/justarouter"
)

type OrgRoutes struct {
	orgHandler        *handler.OrgHandler
	addressHandler    *handler.AddressHandler
	postHandler       *handler.PostHandler
	middlewareService *services.MiddlewareService
}

func InitOrgRoutes(orgHandler *handler.OrgHandler, addressHandler *handler.AddressHandler, postHandler *handler.PostHandler, middlewareService *services.MiddlewareService) *OrgRoutes {
	return &OrgRoutes{
		orgHandler,
		addressHandler,
		postHandler,
		middlewareService,
	}
}

func (o *OrgRoutes) Routes() func(subRouter justarouter.SubRouter) {
	return func(subRouter justarouter.SubRouter) {
		subRouter.Use(o.middlewareService.CSRFMiddleware)
		subRouter.Use(o.middlewareService.AuthMiddleware)

		subRouter.POST("", o.orgHandler.CreateOrg)
		subRouter.GET("", o.orgHandler.GetOrgsByUserId)
		subRouter.PUT("/{orgId}/update/assets", o.orgHandler.UpdateBrandingAssets)
		subRouter.GET("/{orgId}/details", o.orgHandler.GetOrganizationDetailsByOrgId)
		subRouter.GET("/{orgId}/assets", o.orgHandler.GetOrganizationAssetsByOrgId)

		// org/address routes
		subRouter.POST("/{orgId}/addresses", o.addressHandler.CreateAddress)
		subRouter.GET("/{orgId}/addresses", o.addressHandler.GetAddressesByOrgId)
		subRouter.DELETE("/{orgId}/addresses/{addressId}", o.addressHandler.DeleteAddressById)

		// org/post routes
		subRouter.POST("/{orgId}/posts", o.postHandler.CreatePost)
		subRouter.POST("/{orgId}/posts/{postId}/update/additionalInfoLink", o.postHandler.UpdatePostAdditionalInfoLink)
		subRouter.POST("/{orgId}/posts/{postId}/job_details", o.postHandler.CreateJobDetails)
		subRouter.POST("/{orgId}/posts/{postId}/requirements", o.postHandler.CreatePostRequirements)
		subRouter.GET("/{orgId}/posts", o.postHandler.GetPostsByOrg)
	}
}
