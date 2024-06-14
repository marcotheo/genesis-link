package services

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	clog "github.com/marcotheo/genesis-fleet/packages/backend/pkg/logger"
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
	clog.Logger.Info("adding user to user pool")

	secretHash := calculateSecretHash(c.clientId, c.clientSecret, username)

	input := &cognitoidentityprovider.SignUpInput{
		ClientId:   &c.clientId,
		Username:   &username,
		Password:   &password,
		SecretHash: aws.String(secretHash),
	}

	res, errSignUp := c.Client.SignUp(context.TODO(), input)
	if errSignUp != nil {
		return "", fmt.Errorf("failed to create user: %w", errSignUp)
	}

	adminConfirmSignUpInput := &cognitoidentityprovider.AdminConfirmSignUpInput{
		UserPoolId: &c.poolId,
		Username:   &username,
	}

	_, errConfirmSignUp := c.Client.AdminConfirmSignUp(context.TODO(), adminConfirmSignUpInput)
	if errConfirmSignUp != nil {
		return "", fmt.Errorf("failed to create user: %w", errConfirmSignUp)
	}

	clog.Logger.Info("user added successfuly to user pool")

	return *res.UserSub, nil
}
