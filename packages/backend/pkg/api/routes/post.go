package routes

import (
	handler "github.com/marcotheo/genesis-link/packages/backend/pkg/api/handlers"
	"github.com/marcotheo/justarouter"
)

func Post(h *handler.PostHandler) func(subRouter justarouter.SubRouter) {
	return func(subRouter justarouter.SubRouter) {
		subRouter.POST("/create", h.CreateJobPost)
	}
}
