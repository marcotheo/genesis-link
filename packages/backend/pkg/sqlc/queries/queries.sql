-- name: GetUser :one
SELECT * FROM users
WHERE userId = ? LIMIT 1;

-- name: CreateUser :one
INSERT INTO users (
  userId, email
) VALUES (
  ?, ?
)
RETURNING *;

-- name: CreateJobPost :exec
INSERT INTO posts (
    postId,
    title,
    description,
    postType,
    jobType,
    company,
    location,
    salary,
    wfh,
    email,
    phone,
    deadline
) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)
RETURNING *;

-- name: CreateVolunteerPost :one
INSERT INTO posts (
    postId,
    title,
    description,
    postType,
    jobType,
    company,
    location,
    salary,
    wfh,
    email,
    phone,
    deadline
) VALUES (
    ?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ?
)
RETURNING *;

-- name: GetPostsByUserId :many
SELECT  
    postId,
    title,
    jobType,
    company,
    location,
    deadline,
    salary
FROM posts
WHERE userId = ?
ORDER BY posted_at DESC
LIMIT 10 OFFSET ?;

