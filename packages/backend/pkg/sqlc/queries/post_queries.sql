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
    userId,
    embedding
) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, vector32(:embedding)
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