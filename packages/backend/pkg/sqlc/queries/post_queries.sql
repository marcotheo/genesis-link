-- name: CreatePost :exec
INSERT INTO posts (
    postId, 
    title, 
    description, 
    additionalInfoLink, 
    workSetup, 
    deadline, 
    addressId, 
    orgId,
    embedding
) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, vector32(:embedding)
);

-- name: UpdatePostAdditionalInfoLink :exec
UPDATE posts
SET additionalInfoLink = ?
WHERE postId = ? AND orgId = ?;

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

-- name: GetPostsByOrgId :many
SELECT  
    p.postId,
    p.title,
    p.deadline,
    o.company
FROM posts p
LEFT JOIN organizations o
ON p.orgId = o.orgId
WHERE p.orgId = ?
ORDER BY p.posted_at DESC
LIMIT 10 OFFSET ?;

-- name: GetPostCountByOrgId :one
SELECT  
    COUNT(*) AS total_count
FROM posts
WHERE orgId = ?;

-- name: CheckIfPostExistByOrg :one
SELECT postId FROM posts
WHERE postId = ? AND orgId = ?;

-- name: GetPostDetailsByPostId :one
SELECT  
  posts.postId,
    posts.title,
    posts.description,
    posts.additionalInfoLink,
    organizations.company,
    posts.workSetup,
    job_details.jobType,
    job_details.salaryAmountMin,
    job_details.salaryAmountMax,
    job_details.salaryCurrency,
    job_details.salaryType,
    addresses.country,
    addresses.city,
    COALESCE(GROUP_CONCAT(post_tags.tagName, ', '), '') AS tags,
    posts.posted_at
FROM posts
JOIN addresses ON posts.addressId = addresses.addressId
JOIN organizations ON posts.orgId = organizations.orgId
LEFT JOIN post_tags ON posts.postId = post_tags.postId
LEFT JOIN job_details ON posts.postId = job_details.postId
WHERE posts.postId = ?;

-- name: GetPostRequirements :many
SELECT 
    requirementType,
    requirement
FROM post_requirements
WHERE postId = ?;

-- name: JobSearchQuery :many
WITH embedding_vector AS (
    SELECT vector32(:embedding) AS vec
)
SELECT  
    posts.postId,
    posts.title,
    posts.description,
    organizations.company,
    posts.workSetup,
    job_details.jobType,
    job_details.salaryAmountMin,
    job_details.salaryAmountMax,
    job_details.salaryCurrency,
    job_details.salaryType,
    addresses.country,
    addresses.city,
    COALESCE(GROUP_CONCAT(post_tags.tagName, ', '), '') AS tags,
    posts.posted_at
FROM posts, embedding_vector
JOIN addresses ON posts.addressId = addresses.addressId
JOIN organizations ON posts.orgId = organizations.orgId
LEFT JOIN post_tags ON posts.postId = post_tags.postId
LEFT JOIN job_details ON posts.postId = job_details.postId
WHERE 
    vector_distance_cos(posts.embedding, embedding_vector.vec) < 0.6
    AND addresses.country = ?
    AND (:provincenull IS NULL OR addresses.province = ?)
    AND (:citynull IS NULL OR addresses.city = ?)
GROUP BY posts.postId
ORDER BY vector_distance_cos(embedding, embedding_vector.vec) ASC
LIMIT 10 OFFSET ?;

-- name: CreatePostTag :exec
INSERT INTO post_tags (
    tagId, 
    postId, 
    tagName, 
    tagCategory
) VALUES (
    ?,
    ?,
    ?,
    ?
) RETURNING *;

-- name: CreateSavedPost :exec
INSERT INTO saved_posts (
    savedJobId, postId, userId
) VALUES (
    ?, ?, ?
) RETURNING *;

-- name: GetUserSavedPost :one
SELECT savedJobId 
FROM saved_posts
WHERE userId = ? AND postId = ?;

