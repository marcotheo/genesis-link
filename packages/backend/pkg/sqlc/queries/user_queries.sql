-- name: CreateUser :one
INSERT INTO users (
  userId, email
) VALUES (
  ?, ?
)
RETURNING *;

-- name: UpdateResumeLink :exec
UPDATE users
SET resumeLink = ?
WHERE userId = ?;

-- name: UpdateMobileNumber :exec
UPDATE users
SET mobileNumber = ?
WHERE userId = ?;

-- name: UpdateEmail :exec
UPDATE users
SET email = ?
WHERE userId = ?;

-- name: GetUser :one
SELECT * FROM users
WHERE userId = ? LIMIT 1;

-- name: GetUserPost :one
SELECT postId FROM posts
WHERE postId = ? AND userId = ?;