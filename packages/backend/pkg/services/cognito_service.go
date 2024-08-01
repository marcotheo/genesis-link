package services

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
	clog "github.com/marcotheo/genesis-link/packages/backend/pkg/logger"
)

type CognitoService struct {
	Client       *cognitoidentityprovider.Client
	poolId       string
	clientId     string
	clientSecret string
}

func InitCognitoService() *CognitoService {
	cfg := awsConfigInit()

	poolId := os.Getenv("POOL_ID")
	poolClientId := os.Getenv("POOL_CLIENT_ID")
	poolClientSecret := os.Getenv("POOL_CLIENT_SECRET")

	client := cognitoidentityprovider.NewFromConfig(*cfg)
	return &CognitoService{Client: client, poolId: poolId, clientId: poolClientId, clientSecret: poolClientSecret}
}

func calculateSecretHash(clientID, clientSecret, username string) string {
	mac := hmac.New(sha256.New, []byte(clientSecret))
	mac.Write([]byte(username + clientID))
	return base64.StdEncoding.EncodeToString(mac.Sum(nil))
}

func (c *CognitoService) SignUpUser(username string, password string) (string, error) {
	clog.Logger.Info("(COGNITO) adding user")

	secretHash := calculateSecretHash(c.clientId, c.clientSecret, username)

	input := &cognitoidentityprovider.SignUpInput{
		ClientId:   &c.clientId,
		Username:   &username,
		Password:   &password,
		SecretHash: aws.String(secretHash),
		UserAttributes: []types.AttributeType{
			{
				Name:  aws.String("email"),
				Value: aws.String(username),
			},
		},
	}

	res, errSignUp := c.Client.SignUp(context.TODO(), input)
	if errSignUp != nil {
		return "", fmt.Errorf("failed to create user: %w", errSignUp)
	}

	clog.Logger.Info("(COGNITO) user added successfuly")

	return *res.UserSub, nil
}

func (c *CognitoService) SignInUser(username string, password string) (types.AuthenticationResultType, error) {
	clog.Logger.Info("(COGNITO) authenticating user")

	secretHash := calculateSecretHash(c.clientId, c.clientSecret, username)

	input := &cognitoidentityprovider.InitiateAuthInput{
		ClientId: &c.clientId,
		AuthFlow: "USER_PASSWORD_AUTH",
		AuthParameters: map[string]string{
			"USERNAME":    username,
			"PASSWORD":    password,
			"SECRET_HASH": secretHash,
		},
	}

	result, err := c.Client.InitiateAuth(context.TODO(), input)
	if err != nil {
		clog.Logger.Error("(COGNITO) failed authenticate user")

		if strings.Contains(err.Error(), "NotAuthorizedException") {
			return types.AuthenticationResultType{}, errors.New("invalid credentials")
		}

		return types.AuthenticationResultType{}, fmt.Errorf("failed authenticate user: %w", err)
	}

	clog.Logger.Info("(COGNITO) user authenticated")

	// user not expected any challenge since user sign up by themselves
	return *result.AuthenticationResult, nil

}
