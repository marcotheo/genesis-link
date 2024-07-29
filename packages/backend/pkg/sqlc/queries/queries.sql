-- name: GetUser :one
SELECT * FROM users
WHERE userId = ? LIMIT 1;

-- name: CreateUser :one
INSERT INTO users (
  userId, firstName, lastName, email, password, salt
) VALUES (
  ?, ?, ?, ?, ?, ?
)
RETURNING *;