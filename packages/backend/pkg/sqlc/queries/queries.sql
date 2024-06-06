-- name: GetUser :one
SELECT * FROM users
WHERE userId = ? LIMIT 1;