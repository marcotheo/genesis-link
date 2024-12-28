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

-- name: GetAllAddressByUserId :many
SELECT * FROM addresses
WHERE userId = ?;