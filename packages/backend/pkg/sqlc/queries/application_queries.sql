-- name: CreateApplication :one
INSERT INTO applications (
    applicationId, 
    proposalLink, 
    status, 
    postId, 
    userId, 
    created_at, 
    updated_at
) VALUES (
    ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
RETURNING *;

-- name: GetApplicationsByUserId :many
SELECT
    o.company,
    p.title,
    a.applicationId,
    a.status,
    a.postId,
    a.created_at
FROM applications a
LEFT JOIN posts p ON a.postId = p.postId
LEFT JOIN organizations o ON p.orgId = o.orgId
WHERE a.userId = ?
ORDER BY a.created_at DESC
LIMIT ? OFFSET ?;

-- name: GetApplicationsByUserIdCount :one
SELECT  
    COUNT(*) AS total_count
FROM applications
WHERE userId = ?;


-- name: GetApplicationsByPostId :many
SELECT
    u.firstName,
    u.lastName,
    u.email,
    u.mobileNumber,
    u.resumeLink,
    a.userId,
    a.applicationId,
    a.status,
    a.created_at
FROM applications a
LEFT JOIN users u ON a.userId = u.userId
WHERE a.postId = ?
ORDER BY a.created_at DESC
LIMIT ? OFFSET ?;

-- name: GetApplicationsByPostIdCount :one
SELECT  
    COUNT(*) AS total_count
FROM applications
WHERE postId = ?;

-- name: GetProposalLinkByApplicationId :one
SELECT
    proposalLink
FROM applications
WHERE applicationId = ?;