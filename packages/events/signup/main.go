package main

import (
	"context"
	"fmt"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(ctx context.Context, event events.CognitoEventUserPoolsCustomMessage) (events.CognitoEventUserPoolsCustomMessage, error) {
	siteURL := os.Getenv("SITE_URL")

	email := event.Request.UserAttributes["email"]
	confirmationCode := event.Request.CodeParameter

	if siteURL == "" {
		siteURL = "http://localhost:5173" // default value if the env variable is not set
	}

	verificationURL := fmt.Sprintf("%s/user/verify?username=%s&code=%s", siteURL, email, confirmationCode)

	// Set the custom message with the verification URL
	event.Response.EmailMessage = fmt.Sprintf("Please confirm your email address by clicking on the following link: %s", verificationURL)
	event.Response.SMSMessage = fmt.Sprintf("Please confirm your email address by clicking on the following link: %s", verificationURL)

	return event, nil
}

func main() {
	lambda.Start(handler)
}
