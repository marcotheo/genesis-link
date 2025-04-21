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