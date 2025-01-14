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
