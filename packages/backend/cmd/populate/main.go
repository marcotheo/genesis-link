package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/db"
	clog "github.com/marcotheo/genesis-link/packages/backend/pkg/logger"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/services"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

// func generateFakePost(f *faker.Faker, ai *services.OpenAIService, orgId string, addressId string) *db.CreatePostParams {
// 	postId, err := gonanoid.New()
// 	if err != nil {
// 		clog.Logger.Error(fmt.Sprintf("(POST) CreatePost => error generating post id %s \n", err))
// 		return nil
// 	}

// 	jobTitle := gofakeit.JobTitle()
// 	description := gofakeit.Paragraph(2, 3, 5, " ")

// 	embedding, errAI := ai.GenerateEmbedding(jobTitle)
// 	if errAI != nil {
// 		clog.Logger.Error(fmt.Sprintf("(POST) CreatePost => error generating embedding %s \n", err))
// 		return nil
// 	}

// 	return &db.CreatePostParams{
// 		Postid:             postId,
// 		Title:              jobTitle,
// 		Description:        sql.NullString{String: description, Valid: true},
// 		Additionalinfolink: sql.NullString{String: f.Internet().URL(), Valid: true},
// 		Wfh:                sql.NullInt64{Int64: int64(rand.Intn(2)), Valid: true},
// 		Deadline:           sql.NullInt64{Int64: time.Now().Add(time.Duration(rand.Intn(30)+1) * 24 * time.Hour).Unix(), Valid: true},
// 		Addressid:          addressId,
// 		Orgid:              orgId,
// 		Embedding:          embedding,
// 	}
// }

func ConvertToNullString(str string) sql.NullString {
	return sql.NullString{String: str, Valid: str != ""}
}

type CreateAddressParams struct {
	Country        string `json:"country" validate:"required"`
	Region         string `json:"region"`
	Province       string `json:"province"`
	City           string `json:"city" validate:"required"`
	Barangay       string `json:"barangay"`
	AddressDetails string `json:"addressDetails"`
}

type CreateOrgParams struct {
	Company       string              `json:"company"`
	Email         string              `json:"email"`
	ContactNumber string              `json:"contactNumber"`
	BannerLink    string              `json:"bannerLink"`
	LogoLink      string              `json:"logoLink"`
	Address       CreateAddressParams `json:"address"`
}

func CreateOrganization(qtx *db.Queries, userId string, orgData CreateOrgParams) string {
	orgId, err := gonanoid.New()
	if err != nil {
		fmt.Println("Error generating org ID:", err)
		return ""
	}

	// Execute the insert statement.
	if err := qtx.CreateOrganization(context.Background(), db.CreateOrganizationParams{
		Orgid:         orgId,
		Userid:        userId,
		Company:       orgData.Company,
		Email:         orgData.Email,
		Contactnumber: sql.NullString{String: orgData.ContactNumber, Valid: true},
		Bannerlink:    sql.NullString{String: orgData.BannerLink, Valid: true},
		Logolink:      sql.NullString{String: orgData.LogoLink, Valid: true},
	}); err != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreateOrganization => err %s", err))
		return ""
	}

	return orgId
}

func CreateAddress(qtx *db.Queries, orgId string, addressData CreateAddressParams) string {
	addressId, err := gonanoid.New()
	if err != nil {
		fmt.Println("Error generating address ID:", err)
		return ""
	}

	if err := qtx.CreateAddress(context.Background(), db.CreateAddressParams{
		Addressid:      addressId,
		Orgid:          orgId,
		Country:        addressData.Country,
		Region:         ConvertToNullString(addressData.Region),
		Province:       ConvertToNullString(addressData.Province),
		City:           ConvertToNullString(addressData.City),
		Barangay:       ConvertToNullString(addressData.Barangay),
		Addressdetails: ConvertToNullString(addressData.AddressDetails),
	}); err != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreateAddress => err %s", err))
		return ""
	}

	return addressId
}

func main() {
	if err := godotenv.Load(); err != nil {
		fmt.Println("No .env file found")
	}

	dbInstance := services.InitDataService()
	// openAI := services.InitOpenAIService()

	defer dbInstance.Conn.Close()

	// Define the number of dummy posts to insert.
	const userId = "598ad5bc-3061-7010-1b10-168b8a0fcf5f"

	// Open the JSON file
	file, err := os.Open("cmd/populate/org_data.json")
	if err != nil {
		fmt.Println("Error opening file:", err)
		return
	}
	defer file.Close()

	// Read the file contents
	bytes, err := io.ReadAll(file)
	if err != nil {
		fmt.Println("Error reading file:", err)
		return
	}

	// Unmarshal JSON into a slice of structs
	var organizations []CreateOrgParams
	err = json.Unmarshal(bytes, &organizations)
	if err != nil {
		fmt.Println("Error unmarshaling JSON:", err)
		return
	}

	// Begin a database transaction for multi-row insert
	tx, err := dbInstance.Conn.Begin()
	if err != nil {
		clog.Logger.Error(fmt.Sprintf("(POPULATE) ERROR => error beginning transaction: %s", err))
		return
	}

	defer tx.Rollback()

	qtx := dbInstance.Queries.WithTx(tx)

	// Insert dummy posts.
	for _, org := range organizations {
		orgId := CreateOrganization(qtx, userId, org)

		if orgId != "" {
			addressId := CreateAddress(qtx, orgId, org.Address)
			if addressId == "" {
				log.Fatalf("error creating address: %v", err)
				return
			}
		}
	}

	// Commit the transaction.
	if err = tx.Commit(); err != nil {
		log.Fatalf("Failed to commit transaction: %v", err)
		return
	}

	fmt.Println("Successfully inserted 10,000 records!")
}
