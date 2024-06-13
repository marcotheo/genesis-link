package main

import (
	"context"
	"database/sql"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/awslabs/aws-lambda-go-api-proxy/httpadapter"
	"github.com/marcotheo/genesis-fleet/packages/backend/pkg/api"
)

var adapterLambda *httpadapter.HandlerAdapterV2
var conn *sql.DB

// initialize the routes into a lambda adapter
func init() {
	adapterLambda, conn = api.GetLambdaAdapter()
}

// Handler will deal with the routers
func Handler(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	return adapterLambda.ProxyWithContext(ctx, req)
}

func main() {
	defer conn.Close()

	lambda.Start(Handler)
}
