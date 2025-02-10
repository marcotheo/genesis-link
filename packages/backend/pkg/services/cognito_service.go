package services

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
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

func (c *CognitoService) ConfirmUser(username string, code string) (bool, error) {
	clog.Logger.Info("(COGNITO) Confirming User")

	secretHash := calculateSecretHash(c.clientId, c.clientSecret, username)

	input := &cognitoidentityprovider.ConfirmSignUpInput{
		ClientId:         &c.clientId,
		Username:         &username,
		SecretHash:       aws.String(secretHash),
		ConfirmationCode: &code,
	}

	_, err := c.Client.ConfirmSignUp(context.TODO(), input)
	if err != nil {
		return false, fmt.Errorf(err.Error())
	}

	clog.Logger.Info("(COGNITO) User Confirmed")

	return true, nil
}

func decodeJWT(token string) (map[string]interface{}, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, fmt.Errorf("invalid token format")
	}
	decoded, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, fmt.Errorf("failed to decode token: %w", err)
	}
	var claims map[string]interface{}
	if err := json.Unmarshal(decoded, &claims); err != nil {
		return nil, fmt.Errorf("failed to unmarshal claims: %w", err)
	}
	return claims, nil
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

		if strings.Contains(err.Error(), "User does not exist") {
			return types.AuthenticationResultType{}, errors.New("invalid credentials")
		}

		return types.AuthenticationResultType{}, errors.New("something went wrong")

	}

	clog.Logger.Info("(COGNITO) user authenticated")

	// user not expected any challenge since user sign up by themselves
	return *result.AuthenticationResult, nil
}

func (c *CognitoService) GetUserId(accessToken string) (string, error) {
	// Decode the access token to get the 'sub' claim
	claims, err := decodeJWT(accessToken)
	if err != nil {
		return "", fmt.Errorf("failed to decode access token: %w", err)
	}

	sub, ok := claims["sub"].(string)
	if !ok {
		return "", fmt.Errorf("'sub' claim not found in access token")
	}

	return sub, nil
}

func (c *CognitoService) RefreshAccessToken(userId string, refreshToken string) (types.AuthenticationResultType, error) {
	clog.Logger.Info("(COGNITO) refreshing access token")

	secretHash := calculateSecretHash(c.clientId, c.clientSecret, userId)

	input := &cognitoidentityprovider.InitiateAuthInput{
		ClientId: &c.clientId,
		AuthFlow: "REFRESH_TOKEN_AUTH",
		AuthParameters: map[string]string{
			"REFRESH_TOKEN": refreshToken,
			"SECRET_HASH":   secretHash,
		},
	}

	result, err := c.Client.InitiateAuth(context.TODO(), input)
	if err != nil {
		clog.Logger.Error("(COGNITO) failed to refresh access token")
		fmt.Printf("ERROR HERE %v", err.Error())

		if strings.Contains(err.Error(), "NotAuthorizedException") {
			return types.AuthenticationResultType{}, errors.New("invalid refresh token")
		}

		return types.AuthenticationResultType{}, fmt.Errorf("failed refresh access token: %w", err)
	}

	clog.Logger.Info("(COGNITO) access token successfuly refreshed")

	// user not expected any challenge since user sign up by themselves
	return *result.AuthenticationResult, nil
}

func (c *CognitoService) RevokeToken(refreshToken string) error {
	clog.Logger.Info("(COGNITO) revoking refresh token")

	input := &cognitoidentityprovider.RevokeTokenInput{
		ClientId:     &c.clientId,
		ClientSecret: &c.clientSecret,
		Token:        &refreshToken,
	}

	_, err := c.Client.RevokeToken(context.TODO(), input)
	if err != nil {
		clog.Logger.Error("(COGNITO) failed to revoke refresh token")
		fmt.Printf("ERROR HERE %v", err.Error())

		if strings.Contains(err.Error(), "NotAuthorizedException") {
			return errors.New("invalid refresh token")
		}

		return fmt.Errorf("failed revoke refresh token: %w", err)
	}

	clog.Logger.Info("(COGNITO) refresh token revoked")

	// user not expected any challenge since user sign up by themselves
	return nil
}
