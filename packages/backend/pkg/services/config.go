package services

import (
	"context"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
)

type ServicesManager struct {
	cognitoService *CognitoService
}

func awsConfigInit() *aws.Config {
	// Load the AWS configuration with the specified profile
	cfg, err := config.LoadDefaultConfig(context.TODO())

	if err != nil {
		log.Fatal("Unable to load SDK config")
	}

	return &cfg
}
