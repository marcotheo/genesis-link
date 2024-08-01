package main

import (
	"context"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

type Event struct {
	// Request struct {
	// 	UserAttributes map[string]string `json:"userAttributes"`
	// 	CodeParameter  string            `json:"codeParameter"`
	// } `json:"request"`
}

func handler(ctx context.Context, event events.CognitoEventUserPoolsCustomMessage) (events.CognitoEventUserPoolsCustomMessage, error) {
	email := event.Request.UserAttributes["email"]
	confirmationCode := event.Request.CodeParameter

	fmt.Printf("This is the email %v \n", email)
	fmt.Printf("This is the confirmationCode %v \n", confirmationCode)

	return event, nil
}

func main() {
	lambda.Start(handler)
}
