package main

import (
	"context"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/awslabs/aws-lambda-go-api-proxy/httpadapter"
	"github.com/marcotheo/genesis-fleet/packages/backend/pkg/api"
)

var adapterLambda *httpadapter.HandlerAdapterV2

// // initiate
func init() {
	adapterLambda = api.GetLambdaAdapter()
}

// Handler will deal with Fiber working with Lambda
func Handler(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	return adapterLambda.ProxyWithContext(ctx, req)
}

func main() {
	lambda.Start(Handler)
}
