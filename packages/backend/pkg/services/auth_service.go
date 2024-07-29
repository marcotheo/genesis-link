package services

import (
	"crypto/rand"
	"encoding/base64"
	"os"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	pepper string
}

func InitAuthService() *AuthService {
	pepper := os.Getenv("PEPPER")

	return &AuthService{pepper: pepper}
}

// GenerateSalt generates a random salt
func GenerateSalt(size int) (string, error) {
	salt := make([]byte, size)
	_, err := rand.Read(salt)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(salt), nil
}

// CheckPassword compares the hashed password with a plain-text password
func CheckPassword(password, salt, pepper, hashedPassword string) bool {
	// Concatenate password, salt, and pepper
	saltedPepperedPassword := password + salt + pepper

	// Compare the hashed password with the concatenated value
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(saltedPepperedPassword))
	return err == nil
}

func (a *AuthService) HashPassword(password string) (string, string, error) {
	salt, err := GenerateSalt(16)
	if err != nil {
		return "", "", err
	}

	// Concatenate password, salt, and pepper
	saltedPepperedPassword := password + salt + a.pepper

	// Hash the concatenated password using bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(saltedPepperedPassword), bcrypt.DefaultCost)
	if err != nil {
		return "", "", err
	}

	return string(hashedPassword), salt, nil
}

// func (c *AuthService) SignInUser(username string, password string) (types.AuthenticationResultType, error) {
// 	clog.Logger.Info("(COGNITO) authenticating user")

// 	secretHash := calculateSecretHash(c.clientId, c.clientSecret, username)

// 	input := &cognitoidentityprovider.InitiateAuthInput{
// 		ClientId: &c.clientId,
// 		AuthFlow: "USER_PASSWORD_AUTH",
// 		AuthParameters: map[string]string{
// 			"USERNAME":    username,
// 			"PASSWORD":    password,
// 			"SECRET_HASH": secretHash,
// 		},
// 	}

// 	result, err := c.Client.InitiateAuth(context.TODO(), input)
// 	if err != nil {
// 		clog.Logger.Error("(COGNITO) failed authenticate user")

// 		if strings.Contains(err.Error(), "NotAuthorizedException") {
// 			return types.AuthenticationResultType{}, errors.New("invalid credentials")
// 		}

// 		return types.AuthenticationResultType{}, fmt.Errorf("failed authenticate user: %w", err)
// 	}

// 	clog.Logger.Info("(COGNITO) user authenticated")

// 	// user not expected any challenge since user sign up by themselves
// 	return *result.AuthenticationResult, nil

// }
