package handler

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"reflect"
	"strconv"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
)

type Response struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
}

type ErrorResponse struct {
	Message string `json:"message"`
}

func isValidDate(fl validator.FieldLevel) bool {
	dateStr := fl.Field().String()
	_, err := time.Parse("2006-01-02", dateStr)
	return err == nil
}

// Custom validation function for nanoID
func nanoidValidation(fl validator.FieldLevel) bool {
	id := fl.Field().String()
	if len(id) == 0 {
		return false
	}
	return len(id) == 21 // Assuming the nanoID length is 21
}

func ReadAndValidateBody(r *http.Request, v interface{}) error {
	// Read the request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		return fmt.Errorf("unable to read body: %w", err)
	}
	defer r.Body.Close()

	// Unmarshal the JSON data into the provided struct
	err = json.Unmarshal(body, v)
	if err != nil {
		return fmt.Errorf("invalid JSON: %w", err)
	}

	// Validate the struct
	validate := validator.New()

	// Register the custom validation function
	validate.RegisterValidation("nanoid", nanoidValidation)
	validate.RegisterValidation("date", isValidDate)

	err = validate.Struct(v)
	if err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}

	return nil
}

func ParseAndValidateQuery(r *http.Request, v interface{}) error {
	// Validate the struct
	validate := validator.New()

	// Register custom validations once (if not already done)
	validate.RegisterValidation("nanoid", nanoidValidation)
	validate.RegisterValidation("date", isValidDate)

	// Parse query parameters and map to struct
	if err := mapQueryParamsToStruct(r.URL.Query(), v); err != nil {
		return fmt.Errorf("failed to map query parameters: %w", err)
	}

	// Validate the struct
	if err := validate.Struct(v); err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}

	return nil
}

func mapQueryParamsToStruct(values url.Values, v interface{}) error {
	val := reflect.ValueOf(v)
	if val.Kind() != reflect.Ptr || val.IsNil() {
		return fmt.Errorf("v must be a non-nil pointer to a struct")
	}

	val = val.Elem()
	if val.Kind() != reflect.Struct {
		return fmt.Errorf("v must be a pointer to a struct")
	}

	typ := val.Type()
	for i := 0; i < typ.NumField(); i++ {
		field := typ.Field(i)
		fieldValue := val.Field(i)

		// Use the struct field name as the query parameter key (you can customize this)
		paramName := strings.ToLower(field.Name)
		if tag, ok := field.Tag.Lookup("schema"); ok {
			paramName = tag
		}

		// Get the query parameter value
		if paramValue := values.Get(paramName); paramValue != "" {
			if err := setFieldValue(fieldValue, paramValue); err != nil {
				return fmt.Errorf("failed to set field %s: %w", field.Name, err)
			}
		}
	}

	return nil
}

func setFieldValue(field reflect.Value, value string) error {
	if !field.CanSet() {
		return fmt.Errorf("field cannot be set")
	}

	switch field.Kind() {
	case reflect.String:
		field.SetString(value)
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		intVal, err := strconv.ParseInt(value, 10, 64)
		if err != nil {
			return err
		}
		field.SetInt(intVal)
	case reflect.Bool:
		boolVal, err := strconv.ParseBool(value)
		if err != nil {
			return err
		}
		field.SetBool(boolVal)
	default:
		return fmt.Errorf("unsupported field type: %s", field.Kind())
	}

	return nil
}

func convertToUnixTimestamp(dateStr string) (int64, error) {
	t, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return 0, err
	}
	return t.Unix(), nil
}

func errorResponse(w http.ResponseWriter, statusCode int, message string) {
	w.WriteHeader(statusCode)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ErrorResponse{Message: message})
}

func successResponse(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Response{Status: "success", Data: data})
}

func encrypt(data interface{}) (string, error) {
	plainText, err := json.Marshal(data)
	if err != nil {
		return "", err
	}

	key := getSecretKey()
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	cipherText := gcm.Seal(nonce, nonce, plainText, nil)
	return base64.StdEncoding.EncodeToString(cipherText), nil
}

func decrypt(encrypted string, v interface{}) error {
	cipherText, err := base64.StdEncoding.DecodeString(encrypted)
	if err != nil {
		return err
	}

	key := getSecretKey()
	block, err := aes.NewCipher(key)
	if err != nil {
		return err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return err
	}

	nonceSize := gcm.NonceSize()
	if len(cipherText) < nonceSize {
		return fmt.Errorf("ciphertext too short")
	}

	nonce, cipherText := cipherText[:nonceSize], cipherText[nonceSize:]
	plainText, err := gcm.Open(nil, nonce, cipherText, nil)
	if err != nil {
		return err
	}

	err = json.Unmarshal(plainText, v)
	return err
}

func getSecretKey() []byte {
	secretKeyHex := os.Getenv("AUTH_SESSION_SECRET")
	if len(secretKeyHex) != 64 {
		log.Fatal("AUTH_SESSION_SECRET environment variable must be 64 hex characters (32 bytes)")
	}
	secretKey, err := hex.DecodeString(secretKeyHex)
	if err != nil {
		log.Fatal("Invalid hex key: ", err)
	}
	return secretKey
}

type AuthSession struct {
	RefreshToken string `json:"refresh_token"`
	Sub          string `json:"sub"`
}
