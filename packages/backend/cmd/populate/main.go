package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/db"
	clog "github.com/marcotheo/genesis-link/packages/backend/pkg/logger"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/services"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

func convertToUnixTimestamp(dateStr string) (int64, error) {
	t, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return 0, err
	}
	return t.Unix(), nil
}

func ConvertToNullString(str string) sql.NullString {
	return sql.NullString{String: str, Valid: str != ""}
}

func ConvertToNullInt(value int64) sql.NullInt64 {
	return sql.NullInt64{Int64: value, Valid: true}
}

type CreateAddressParams struct {
	Country        string `json:"country" validate:"required"`
	Region         string `json:"region"`
	Province       string `json:"province"`
	City           string `json:"city" validate:"required"`
	Barangay       string `json:"barangay"`
	AddressDetails string `json:"addressDetails"`
}

type PostTag struct {
	TagName     string `json:"tagName" validate:"required"`
	TagCategory string `json:"tagCategory" validate:"required"`
}

type CreateJobDetailsParams struct {
	JobType         string `json:"jobType" validate:"oneof=full-time part-time contract internship"`
	SalaryType      string `json:"salaryType" validate:"omitempty,oneof=fixed hourly monthly"`
	SalaryAmountMin int    `json:"salaryAmountMin"`
	SalaryAmountMax int    `json:"salaryAmountMax"`
	SalaryCurrency  string `json:"salaryCurrency"`
}

type Requirement struct {
	RequirementType string `json:"requirementType" validate:"required,oneof=responsibility qualification"`
	Requirement     string `json:"requirement" validate:"required,min=1,max=500"`
}
type PostRequirementsParams struct {
	Requirements []Requirement `json:"requirements" validate:"required,dive"`
}

type CreatePostParams struct {
	Title              string                 `json:"title" validate:"required"`
	Description        string                 `json:"description"`
	AdditionalInfoLink string                 `json:"additionalInfoLink"`
	Worksetup          string                 `json:"workSetup" validate:"required,oneof=remote on-site hybrid"`
	Deadline           string                 `json:"deadline" validate:"required,date"`
	AddressId          string                 `json:"addressId" validate:"required,nanoid"`
	Tags               []PostTag              `json:"tags" validate:"required,dive"`
	JobDetails         CreateJobDetailsParams `json:"jobDetails"`
	PostRequirements   PostRequirementsParams `json:"postRequirements"`
}

type CreateOrgParams struct {
	Company       string              `json:"company"`
	Email         string              `json:"email"`
	ContactNumber string              `json:"contactNumber"`
	BannerLink    string              `json:"bannerLink"`
	LogoLink      string              `json:"logoLink"`
	Address       CreateAddressParams `json:"address"`
	Posts         []CreatePostParams  `json:"posts"`
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

func CreatePost(qtx *db.Queries, openAI *services.OpenAIService, orgId string, addressId string, postDataParams CreatePostParams) string {
	postId, err := gonanoid.New()
	if err != nil {
		fmt.Println("Error generating post ID:", err)
		return ""
	}

	var tagNames []string
	for _, tag := range postDataParams.Tags {
		tagName := strings.TrimSpace(strings.ToLower(tag.TagName)) // Remove spaces and convert to uppercase
		if tagName != "" {                                         // Only add non-empty tag names
			tagNames = append(tagNames, tagName)
		}
	}

	embeddingInput := fmt.Sprintf("%s | %s",
		strings.TrimSpace(strings.ToLower(postDataParams.Title)),
		strings.Join(tagNames, ", "))

	fmt.Printf("Embedding here %v \n", embeddingInput)

	embedding, err := openAI.GenerateEmbedding(embeddingInput)
	if err != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreatePost => error generating embedding %s \n", err))
		return ""
	}

	// Convert deadline to UNIX timestamp
	deadlineTimestamp, err := convertToUnixTimestamp(postDataParams.Deadline)
	if err != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreatePost => err converting deadlinetimestamp %s", err))
		return ""
	}

	// Create Post
	if err := qtx.CreatePost(context.Background(), db.CreatePostParams{
		Postid:             postId,
		Addressid:          addressId,
		Orgid:              orgId,
		Title:              postDataParams.Title,
		Description:        ConvertToNullString(postDataParams.Description),
		Worksetup:          postDataParams.Worksetup,
		Additionalinfolink: ConvertToNullString(postDataParams.AdditionalInfoLink),
		Deadline:           sql.NullInt64{Int64: deadlineTimestamp, Valid: true},
		Embedding:          embedding,
	}); err != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreatePost => err %s", err))
		return ""
	}

	// Create Tags
	for _, tag := range postDataParams.Tags {
		tagId, err := gonanoid.New()
		if err != nil {
			clog.Logger.Error(fmt.Sprintf("(POST) CreatePostTag => Error generating tagId: %s", err))
			return ""
		}

		// Insert the skill into the database
		if err := qtx.CreatePostTag(context.Background(), db.CreatePostTagParams{
			Tagid:       tagId,
			Postid:      postId,
			Tagname:     tag.TagName,
			Tagcategory: ConvertToNullString(tag.TagCategory),
		}); err != nil {
			clog.Logger.Error(fmt.Sprintf("(POST) CreatePostTag => err %s", err))
			return ""
		}
	}

	// Create Post Job Details
	jobDetailsId, err := gonanoid.New()
	if err != nil {
		fmt.Println("Error generating jobDetailsId:", err)
		return ""
	}

	if err := qtx.CreateJobDetails(context.Background(), db.CreateJobDetailsParams{
		Jobdetailid:     jobDetailsId,
		Postid:          postId,
		Jobtype:         postDataParams.JobDetails.JobType,
		Salarytype:      ConvertToNullString(postDataParams.JobDetails.SalaryType),
		Salaryamountmin: ConvertToNullInt(int64(postDataParams.JobDetails.SalaryAmountMin)),
		Salaryamountmax: ConvertToNullInt(int64(postDataParams.JobDetails.SalaryAmountMax)),
		Salarycurrency:  ConvertToNullString(postDataParams.JobDetails.SalaryCurrency),
	}); err != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreateJobDetails => err %s", err))
		return ""
	}

	// Create Post Requirements
	for _, data := range postDataParams.PostRequirements.Requirements {
		requirementId, err := gonanoid.New()
		if err != nil {
			fmt.Println("(POST) CreatePostRequirements => Error generating ID:", err)
			return ""
		}

		if err = qtx.CreatePostRequirement(context.Background(), db.CreatePostRequirementParams{
			Postid:          postId,
			Requirementid:   requirementId,
			Requirementtype: data.RequirementType,
			Requirement:     data.Requirement,
		}); err != nil {
			clog.Logger.Error(fmt.Sprintf("(POST) CreatePostRequirements => err %s \n", err))
			return ""
		}
	}

	return postId
}

func main() {
	if err := godotenv.Load(); err != nil {
		fmt.Println("No .env file found")
	}

	dbInstance := services.InitDataService()
	openAI := services.InitOpenAIService()

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

			for _, postParams := range org.Posts {
				postId := CreatePost(qtx, openAI, orgId, addressId, postParams)
				if postId == "" {
					log.Fatalf("error creating post: %v", err)
					return
				}
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
