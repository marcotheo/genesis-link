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
    applicationId,
    proposalLink,
    status,
    postId,
    created_at
FROM applications
WHERE userId = ?
ORDER BY created_at DESC
LIMIT ? OFFSET ?;

-- name: GetApplicationsByUserIdCount :one
SELECT  
    COUNT(*) AS total_count
FROM applications
WHERE userId = ?;
