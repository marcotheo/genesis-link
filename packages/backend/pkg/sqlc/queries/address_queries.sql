-- name: CreateAddress :exec
INSERT INTO addresses (
    addressId,
    country,
    region,
    province,
    city,
    barangay,
    addressDetails,
    orgId
) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?
)
RETURNING *;

-- name: DeleteAddress :exec
DELETE FROM addresses
WHERE addressId = ? AND orgId = ?;

-- name: GetAllAddressByOrgId :many
SELECT * FROM addresses
WHERE orgId = ?;