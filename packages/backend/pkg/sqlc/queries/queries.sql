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
    deadline,
    posted_at,
    updated_at
) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
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
    deadline,
    posted_at,
    updated_at
) VALUES (
    ?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ?, ?
)
RETURNING *;