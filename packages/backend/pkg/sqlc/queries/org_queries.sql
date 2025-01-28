-- name: CreateOrganization :exec
INSERT INTO organizations (
    orgId, 
    company, 
    email, 
    contactNumber, 
    bannerLink, 
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

-- name: GetOrganizationDetailsByOrgId :one
SELECT 
    company, 
    email, 
    contactNumber,
    created_at
FROM organizations
WHERE orgId = ?;

-- name: GetOrganizationAssetsByOrgId :one
SELECT 
    bannerLink, 
    logoLink
FROM organizations
WHERE orgId = ?;

-- name: UpdateLogoLink :exec
UPDATE organizations
SET logoLink = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE orgId = ?;

-- name: UpdateBannerLink :exec
UPDATE organizations
SET bannerLink = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE orgId = ?;
