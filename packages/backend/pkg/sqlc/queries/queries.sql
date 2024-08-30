-- name: GetUser :one
SELECT * FROM users
WHERE userId = ? LIMIT 1;

-- name: CreateUser :one
INSERT INTO users (
  userId, email
) VALUES (
  ?, ?
)
RETURNING *;

-- name: CreateAddress :exec
INSERT INTO addresses (
    addressId,
    country,
    region,
    province,
    city,
    barangay,
    addressDetails
) VALUES (
    ?, ?, ?, ?, ?, ?, ?
)
RETURNING *;

-- name: CreatePost :exec
INSERT INTO posts (
    postId,
    company,
    title,
    description,
    posterLink,
    logoLink,
    additionalInfoLink,
    wfh,
    email,
    phone,
    deadline,
    addressId,
    userId
) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)
RETURNING *;

-- name: CreateJobDetails :exec
INSERT INTO job_details (
    jobDetailId,
    postId,
    jobType,
    salaryType,
    salaryAmountMin,
    salaryAmountMax,
    salaryCurrency
) VALUES (
    ?, ?, ?, ?, ?, ?, ?
)
RETURNING *;

-- name: CreatePostRequirement :exec
INSERT INTO post_requirements (
    requirementId,
    postId,
    requirementType,
    requirement
) VALUES (
    ?, ?, ?, ?
)
RETURNING *;

-- name: GetPostsByUserId :many
SELECT  
    postId,
    title,
    jobType,
    company,
    location,
    deadline,
    salary
FROM posts
WHERE userId = ?
ORDER BY posted_at DESC
LIMIT 10 OFFSET ?;

-- name: GetPostCountByUserId :one
SELECT  
    COUNT(*) AS total_count
FROM posts
WHERE userId = ?;

