-- name: GetUser :one
SELECT * FROM users
WHERE userId = ? LIMIT 1;

-- name: GetAllAddressByUserId :many
SELECT * FROM addresses
WHERE userId = ?;

-- name: GetUserPost :one
SELECT postId FROM posts
WHERE postId = ? AND userId = ?;

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
    addressDetails,
    userId
) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?
)
RETURNING *;

-- name: DeleteAddress :exec
DELETE FROM addresses
WHERE addressId = ? AND userId = ?;

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

-- name: UpdatePostAdditionalInfoLink :exec
UPDATE posts
SET additionalInfoLink = ?
WHERE postId = ? AND userId = ?;


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

-- name: CreateApplication :one
INSERT INTO applications (
    applicationId, 
    resumeLink, 
    status, 
    postId, 
    userId, 
    created_at, 
    updated_at
) VALUES (
    ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
RETURNING *;

-- name: GetPostsByUserId :many
SELECT  
    postId,
    title,
    company,
    deadline
FROM posts
WHERE userId = ?
ORDER BY posted_at DESC
LIMIT 10 OFFSET ?;

-- name: GetPostCountByUserId :one
SELECT  
    COUNT(*) AS total_count
FROM posts
WHERE userId = ?;

-- name: GetPostDetailsByPostId :one
SELECT  
   p.*,
   jb.*
FROM posts p
LEFT JOIN job_details jb
ON p.postId = jb.postId
WHERE p.postId = ?;

