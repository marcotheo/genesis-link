-- name: CreateUser :one
INSERT INTO users (
  userId, email
) VALUES (
  ?, ?
)
RETURNING *;

-- name: CreateUserSkill :exec
INSERT INTO user_skills (
    skillId,
    userId,
    skillName,
    skillLevel,
    skillCategory
) VALUES (
    ?, ?, ?, ?, ?
);

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

-- name: GetUserSkillsByUserId :many
SELECT 
    skillId,
    skillName,
    skillLevel,
    skillCategory
FROM user_skills
WHERE userId = ?;
