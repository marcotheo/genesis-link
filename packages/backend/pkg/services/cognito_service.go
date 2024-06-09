package services

import (
	"fmt"

	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
)

type CognitoService struct {
	Client *cognitoidentityprovider.Client
}

func InitCognitoService() *CognitoService {
	cfg := awsConfigInit()
	client := cognitoidentityprovider.NewFromConfig(*cfg)
	return &CognitoService{Client: client}
}

func (cognito *CognitoService) registerUser() {
	fmt.Println("Adding User")
}
