-- name: CreateOrganization :exec
INSERT INTO organizations (
    orgId, 
    company, 
    email, 
    mobileNumber, 
    posterLink, 
    logoLink,
    userId
) VALUES (
    ?, ?, ?, ?, ?, ?, ?
);

-- name: GetOrganizationsByUserId :many
SELECT 
    orgId,
    company, 
    email, 
    created_at
FROM organizations
WHERE userId = ?
ORDER BY created_at DESC
LIMIT ? OFFSET ?;

-- name: GetOrganizationsCountByuserId :one
SELECT  
    COUNT(*) AS total_count
FROM organizations
WHERE userId = ?;