package handler

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"sync"

	"github.com/jinzhu/copier"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/db"
	clog "github.com/marcotheo/genesis-link/packages/backend/pkg/logger"
	"github.com/marcotheo/genesis-link/packages/backend/pkg/services"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

type PostHandler struct {
	dataService    *services.DataService
	utilService    *services.UtilService
	cognitoService *services.CognitoService
	openAIService  *services.OpenAIService
}

func InitPostHandler(dataService *services.DataService, utilService *services.UtilService, cognitoService *services.CognitoService, openAIService *services.OpenAIService) *PostHandler {
	return &PostHandler{
		dataService:    dataService,
		utilService:    utilService,
		cognitoService: cognitoService,
		openAIService:  openAIService,
	}
}

type PostTag struct {
	TagName     string `json:"tagName" validate:"required"`
	TagCategory string `json:"tagCategory" validate:"required"`
}

type CreatePostParams struct {
	Title              string    `json:"title" validate:"required"`
	Description        string    `json:"description"`
	AdditionalInfoLink string    `json:"additionalInfoLink"`
	Worksetup          string    `json:"workSetup" validate:"required,oneof=remote on-site hybrid"`
	Deadline           string    `json:"deadline" validate:"required,date"`
	AddressId          string    `json:"addressId" validate:"required,nanoid"`
	Tags               []PostTag `json:"tags" validate:"required,dive"`
}

type CreatePostResponse struct {
	PostId string `json:"postId"`
}

func (h *PostHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(POST) CreatePost => invoked")

	orgId := r.PathValue("orgId")

	var createPostParams CreatePostParams

	errRead := ReadAndValidateBody(r, &createPostParams)
	if errRead != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreatePost => ReadAndValidateBody %s", errRead))
		http.Error(w, errRead.Error(), http.StatusBadRequest)
		return
	}

	// Convert deadline to UNIX timestamp
	deadlineTimestamp, err := convertToUnixTimestamp(createPostParams.Deadline)
	if err != nil {
		http.Error(w, "Invalid deadline format", http.StatusBadRequest)
		return
	}

	// pass the validated data to actual db params
	var postData db.CreatePostParams
	errCopier := copier.Copy(&postData, &createPostParams)
	if errCopier != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreatePost => Error copying: %s", errCopier))
		errorResponse(w, http.StatusInternalServerError, "Something Went Wrong")
		return
	}

	postId, err := gonanoid.New()
	if err != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreatePost => error generating post id %s \n", err))
		http.Error(w, "Something Went Wrong", http.StatusInternalServerError)
		return
	}

	postData.Postid = postId
	postData.Orgid = orgId
	postData.Deadline = sql.NullInt64{Int64: deadlineTimestamp, Valid: true}

	var tagNames []string
	for _, tag := range createPostParams.Tags {
		tagName := strings.TrimSpace(strings.ToLower(tag.TagName)) // Remove spaces and convert to uppercase
		if tagName != "" {                                         // Only add non-empty tag names
			tagNames = append(tagNames, tagName)
		}
	}

	embeddingInput := fmt.Sprintf("%s | %s",
		strings.TrimSpace(strings.ToLower(createPostParams.Title)),
		strings.Join(tagNames, ", "))

	postData.Embedding, err = h.openAIService.GenerateEmbedding(embeddingInput)

	if err != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreatePost => error generating embedding %s \n", err))
		http.Error(w, "Something Went Wrong", http.StatusInternalServerError)
		return
	}

	errQ := h.dataService.Queries.CreatePost(context.Background(), postData)
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreatePost => errQ %s \n", errQ))
		http.Error(w, "Something Went Wrong", http.StatusInternalServerError)
		return
	}

	clog.Logger.Success("(POST) CreatePost => post created")

	// ---------- INSERT THE TAGS -------------

	// Begin a database transaction for multi-row insert
	tx, err := h.dataService.Conn.Begin()
	if err != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreateUserSkills => error beginning transaction: %s", err))
		errorResponse(w, http.StatusInternalServerError, "Something Went Wrong")
		return
	}

	defer tx.Rollback()

	qtx := h.dataService.Queries.WithTx(tx)

	// Insert each tag for the post
	for _, tag := range createPostParams.Tags {
		tagId, err := gonanoid.New()
		if err != nil {
			clog.Logger.Error(fmt.Sprintf("(POST) CreatePost => Error generating tagId: %s", err))
			http.Error(w, "Error Generating TagId", http.StatusInternalServerError)
			return
		}

		// Insert the skill into the database
		if err := qtx.CreatePostTag(context.Background(), db.CreatePostTagParams{
			Tagid:       tagId,
			Postid:      postId,
			Tagname:     tag.TagName,
			Tagcategory: h.utilService.StringToNullString(tag.TagCategory),
		}); err != nil {
			clog.Logger.Error(fmt.Sprintf("(POST) CreateUserSkills => err %s", err))
			http.Error(w, "Error inserting skill data", http.StatusInternalServerError)
			return
		}

	}

	// Commit the transaction
	if err = tx.Commit(); err != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreateUserSkills => err %s", err))
		http.Error(w, "Error committing transaction", http.StatusInternalServerError)
		return
	}

	clog.Logger.Success("(POST) CreatePost => tags created")

	// ---------- INSERT THE TAGS -------------

	successResponse(w, CreatePostResponse{PostId: postId})
}

type UpdatePostAdditionalInfoLinkParams struct {
	AdditionalInfoLink string `json:"additionalInfoLink" validate:"required"`
}

func (h *PostHandler) UpdatePostAdditionalInfoLink(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(POST) UpdatePostAdditionalInfoLink => invoked")

	postId := r.PathValue("postId")
	orgId := r.PathValue("orgId")

	var params UpdatePostAdditionalInfoLinkParams

	errRead := ReadAndValidateBody(r, &params)
	if errRead != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) UpdatePostAdditionalInfoLink => ReadAndValidateBody %s", errRead))
		http.Error(w, errRead.Error(), http.StatusBadRequest)
		return
	}

	errQ := h.dataService.Queries.UpdatePostAdditionalInfoLink(context.Background(), db.UpdatePostAdditionalInfoLinkParams{
		Orgid:  orgId,
		Postid: postId,
		Additionalinfolink: sql.NullString{
			Valid:  true,
			String: params.AdditionalInfoLink,
		},
	})
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) UpdatePostAdditionalInfoLink => errQ %s \n", errQ))
		http.Error(w, "Something Went Wrong", http.StatusInternalServerError)
		return
	}

	clog.Logger.Success("(POST) UpdatePostAdditionalInfoLink => update successful")

	w.WriteHeader(http.StatusNoContent)
}

type CreateJobDetailsParams struct {
	JobType         string `json:"jobType" validate:"oneof=full-time part-time contract internship"`
	SalaryType      string `json:"salaryType" validate:"omitempty,oneof=fixed hourly monthly"`
	SalaryAmountMin int    `json:"salaryAmountMin"`
	SalaryAmountMax int    `json:"salaryAmountMax"`
	SalaryCurrency  string `json:"salaryCurrency"`
}

func (h *PostHandler) CreateJobDetails(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(POST) CreateJobDetails => invoked")

	postId := r.PathValue("postId")
	orgId := r.PathValue("orgId")

	var jobDetailsParams CreateJobDetailsParams

	errRead := ReadAndValidateBody(r, &jobDetailsParams)
	if errRead != nil {
		http.Error(w, errRead.Error(), http.StatusBadRequest)
		return
	}

	_, errGetPostQuery := h.dataService.Queries.CheckIfPostExistByOrg(context.Background(), db.CheckIfPostExistByOrgParams{
		Orgid:  orgId,
		Postid: postId,
	})

	if errGetPostQuery != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreateJobDetails => error searching for post %s \n", errGetPostQuery))

		if strings.Contains(errGetPostQuery.Error(), "sql: no rows in result set") {
			http.Error(w, "Related post not found", http.StatusBadRequest)
		} else {
			http.Error(w, "Error finding post", http.StatusInternalServerError)
		}

		return
	}

	// pass the validated data to actual db params
	var jobDetailsData db.CreateJobDetailsParams
	errCopier := copier.Copy(&jobDetailsData, &jobDetailsParams)
	if errCopier != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreateJobDetails => Error copying: %s", errCopier))
		errorResponse(w, http.StatusInternalServerError, "Something Went Wrong")
		return
	}

	jobDetailsId, err := gonanoid.New()
	if err != nil {
		fmt.Println("Error generating ID:", err)
		return
	}

	jobDetailsData.Jobdetailid = jobDetailsId
	jobDetailsData.Postid = postId

	errQ := h.dataService.Queries.CreateJobDetails(context.Background(), jobDetailsData)
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreateJobDetails => errQ %s \n", errQ))
		http.Error(w, "Error creating response", http.StatusInternalServerError)
		return
	}

	clog.Logger.Success("(POST) CreateJobDetails => create successful")

	w.WriteHeader(http.StatusNoContent)
}

type RequirementParams struct {
	RequirementType string `json:"requirementType" validate:"required,oneof=responsibility qualification"`
	Requirement     string `json:"requirement" validate:"required,min=1,max=500"`
}
type PostRequirementsParams struct {
	Requirements []RequirementParams `json:"requirements" validate:"required,dive"`
}

func (h *PostHandler) CreatePostRequirements(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(POST) CreatePostRequirements => invoked")

	var postRequirementsParams PostRequirementsParams

	if err := ReadAndValidateBody(r, &postRequirementsParams); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	postId := r.PathValue("postId")
	orgId := r.PathValue("orgId")

	_, errGetPostQuery := h.dataService.Queries.CheckIfPostExistByOrg(context.Background(), db.CheckIfPostExistByOrgParams{
		Orgid:  orgId,
		Postid: postId,
	})

	if errGetPostQuery != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreatePostRequirements => error searching for post %s \n", errGetPostQuery))

		if strings.Contains(errGetPostQuery.Error(), "sql: no rows in result set") {
			http.Error(w, "Related post not found", http.StatusBadRequest)
		} else {
			http.Error(w, "Error finding post", http.StatusInternalServerError)
		}

		return
	}

	// creating transaction for multi row insert
	tx, err := h.dataService.Conn.Begin()

	if err != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreatePostRequirements => error beginning transaction: %s", err))
		errorResponse(w, http.StatusInternalServerError, "Something Went Wrong")
		return
	}

	defer tx.Rollback()

	qtx := h.dataService.Queries.WithTx(tx)

	for _, data := range postRequirementsParams.Requirements {
		requirementId, err := gonanoid.New()

		if err != nil {
			fmt.Println("(POST) CreatePostRequirements => Error generating ID:", err)
			return
		}

		if err = qtx.CreatePostRequirement(context.Background(), db.CreatePostRequirementParams{
			Postid:          postId,
			Requirementid:   requirementId,
			Requirementtype: data.RequirementType,
			Requirement:     data.Requirement,
		}); err != nil {
			clog.Logger.Error(fmt.Sprintf("(POST) CreatePostRequirements => err %s \n", err))
			http.Error(w, "error inserting post requirement data", http.StatusInternalServerError)
			return
		}
	}

	// Commit the transaction
	if err = tx.Commit(); err != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) CreatePostRequirements => err %s \n", err))
		http.Error(w, "error commiting transaction", http.StatusInternalServerError)
		return
	}

	clog.Logger.Success("(POST) CreatePostRequirements => create successful")

	w.WriteHeader(http.StatusNoContent)
}

type Post struct {
	PostId   string `json:"postId"`
	Title    string `json:"title"`
	Deadline int64  `json:"deadline,omitempty"`
}

type GetPostsResponse struct {
	Posts []Post `json:"posts"`
	Total int64  `json:"total"`
}

func (h *PostHandler) GetPostsByOrg(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(GET) GetPostsByOrg => invoked")

	pageStr := r.URL.Query().Get("page")
	if pageStr == "" {
		http.Error(w, "Page parameter is required", http.StatusBadRequest)
		return
	}

	page, err := strconv.Atoi(pageStr)
	if err != nil {
		http.Error(w, "Page must be a number", http.StatusBadRequest)
		return
	}

	orgId := r.PathValue("orgId")

	posts, errQ := h.dataService.Queries.GetPostsByOrgId(context.Background(), db.GetPostsByOrgIdParams{Offset: int64((page - 1) * 10), Orgid: orgId})
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(GET) GetPostsByOrg => errQ %s \n", errQ))
		http.Error(w, "Error fetching response", http.StatusInternalServerError)
		return
	}

	totalCount, errQ := h.dataService.Queries.GetPostCountByOrgId(context.Background(), orgId)
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(GET) GetPostsByOrg => errQ %s \n", errQ))
		http.Error(w, "Error fetching response", http.StatusInternalServerError)
		return
	}

	var postsData []Post

	for _, post := range posts {
		item := Post{
			PostId:   post.Postid,
			Title:    post.Title,
			Deadline: h.utilService.ConvertNullInt64(post.Deadline),
		}

		postsData = append(postsData, item)
	}

	clog.Logger.Success("(GET) GetPostsByOrg => successful")

	successResponse(w, GetPostsResponse{Posts: postsData, Total: totalCount})
}

type Requirement struct {
	Requirementtype string `json:"requirementType"`
	Requirement     string `json:"requirement"`
}
type JobPostFullDetails struct {
	PostId          string        `json:"postId"`
	Title           string        `json:"title"`
	Company         string        `json:"company,omitempty"`
	Description     string        `json:"description"`
	Worksetup       string        `json:"workSetup"`
	JobType         string        `json:"jobType"`
	SalaryAmountMin int64         `json:"salaryAmountMin"`
	SalaryAmountMax int64         `json:"salaryAmountMax"`
	SalaryCurrency  string        `json:"salaryCurrency"`
	SalaryType      string        `json:"salaryType"`
	Country         string        `json:"country"`
	City            string        `json:"city"`
	Tags            []string      `json:"tags"`
	Requirements    []Requirement `json:"requirements"`
	PostedAt        int64         `json:"postedAt"`
}

func (h *PostHandler) GetPostDetails(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(GET) GetPostDetails => invoked")

	postId := r.PathValue("postId")

	var post db.GetPostDetailsByPostIdRow
	var requirements []Requirement
	var wg sync.WaitGroup
	errChan := make(chan error, 1) // Buffered channel to capture the first error

	wg.Add(2)

	go func() {
		defer wg.Done()

		postDbResponse, err := h.dataService.Queries.GetPostDetailsByPostId(context.Background(), postId)

		if err != nil {
			clog.Logger.Error(fmt.Sprintf("(GET) GetPostDetails => error fetch post details %s \n", err))
			errChan <- fmt.Errorf("error fetching post details: %v", err)
			return
		}

		post = postDbResponse
	}()

	go func() {
		defer wg.Done()

		rawRequirements, err := h.dataService.Queries.GetPostRequirements(context.Background(), postId)
		if err != nil {
			clog.Logger.Error(fmt.Sprintf("(GET) GetPostDetails => error fetch post requirements %s \n", err))
			errChan <- fmt.Errorf("error fetch post requirements: %v", err)
			return
		}

		requirements = make([]Requirement, len(rawRequirements))

		for i, req := range rawRequirements {
			requirements[i] = Requirement{
				Requirementtype: req.Requirementtype,
				Requirement:     req.Requirement,
			}
		}
	}()

	wg.Wait()
	close(errChan)

	if err := <-errChan; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if post.Postid == "" {
		clog.Logger.Error("(GET) GetPostDetails => post does not exist")
		errorResponse(w, http.StatusBadRequest, "post does not exist!")
		return
	}

	var tags []string

	if post.Tags != "" {
		tags = strings.Split(post.Tags.(string), ", ")
	}

	clog.Logger.Success("(GET) GetPosts => successful")

	successResponse(w, JobPostFullDetails{
		PostId:          post.Postid,
		Title:           post.Title,
		Company:         post.Company,
		Description:     h.utilService.ConvertNullString(post.Description),
		Worksetup:       post.Worksetup,
		JobType:         h.utilService.ConvertNullString(post.Jobtype),
		SalaryAmountMin: h.utilService.ConvertNullInt64(post.Salaryamountmin),
		SalaryAmountMax: h.utilService.ConvertNullInt64(post.Salaryamountmax),
		SalaryCurrency:  h.utilService.ConvertNullString(post.Salarycurrency),
		SalaryType:      h.utilService.ConvertNullString(post.Salarytype),
		Country:         post.Country,
		City:            h.utilService.ConvertNullString(post.City),
		Tags:            tags,
		Requirements:    requirements,
		PostedAt:        h.utilService.ConvertNullTime(post.PostedAt),
	})
}

type JobPostPartial struct {
	PostId          string   `json:"postId"`
	Title           string   `json:"title"`
	Company         string   `json:"company,omitempty"`
	Description     string   `json:"description"`
	Worksetup       string   `json:"workSetup"`
	JobType         string   `json:"jobType"`
	SalaryAmountMin int64    `json:"salaryAmountMin"`
	SalaryAmountMax int64    `json:"salaryAmountMax"`
	SalaryCurrency  string   `json:"salaryCurrency"`
	SalaryType      string   `json:"salaryType"`
	Country         string   `json:"country"`
	City            string   `json:"city"`
	Tags            []string `json:"tags"`
	PostedAt        int64    `json:"postedAt"`
}

type SearchJobParams struct {
	Keyword  string `json:"keyword" validate:"required"`
	Province string `json:"province"`
	City     string `json:"city"`
	Page     int64  `json:"page" validate:"required"`
}

type SearchJobResponse struct {
	Posts []JobPostPartial `json:"posts"`
}

func (h *PostHandler) SearchJob(w http.ResponseWriter, r *http.Request) {
	clog.Logger.Info("(POST) SearchJob => invoked")

	var params SearchJobParams

	if err := ReadAndValidateBody(r, &params); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	matchEmbedding, err := h.openAIService.GenerateEmbedding(strings.ToLower(params.Keyword))
	if err != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) SearchJob => error generating embedding %s \n", err))
		http.Error(w, "Something Went Wrong", http.StatusInternalServerError)
		return
	}

	clog.Logger.Info("(POST) SearchJob => querying for jobs ...")

	posts, errQ := h.dataService.Queries.JobSearchQuery(context.Background(), db.JobSearchQueryParams{
		Offset:       int64((params.Page - 1) * 10),
		Embedding:    matchEmbedding,
		Country:      "Philippines",
		Province:     h.utilService.StringToNullString(params.Province),
		Provincenull: h.utilService.StringToNullString(params.Province),
		Citynull:     h.utilService.StringToNullString(params.City),
		City:         h.utilService.StringToNullString(params.City),
	})
	if errQ != nil {
		clog.Logger.Error(fmt.Sprintf("(POST) SearchJob => errQ %s \n", errQ))
		http.Error(w, "Error fetching data", http.StatusInternalServerError)
		return
	}

	var postsData []JobPostPartial

	for _, post := range posts {
		var tags []string

		if post.Tags != "" {
			tags = strings.Split(post.Tags.(string), ", ")
		}

		item := JobPostPartial{
			PostId:          post.Postid,
			Company:         post.Company,
			Title:           post.Title,
			Description:     h.utilService.ConvertNullString(post.Description),
			Worksetup:       post.Worksetup,
			JobType:         h.utilService.ConvertNullString(post.Jobtype),
			SalaryAmountMin: h.utilService.ConvertNullInt64(post.Salaryamountmin),
			SalaryAmountMax: h.utilService.ConvertNullInt64(post.Salaryamountmax),
			SalaryCurrency:  h.utilService.ConvertNullString(post.Salarycurrency),
			SalaryType:      h.utilService.ConvertNullString(post.Salarytype),
			Country:         post.Country,
			City:            h.utilService.ConvertNullString(post.City),
			Tags:            tags,
			PostedAt:        h.utilService.ConvertNullTime(post.PostedAt),
		}

		postsData = append(postsData, item)
	}

	clog.Logger.Success("(POST) SearchJob => successful")

	successResponse(w, SearchJobResponse{Posts: postsData})
}
