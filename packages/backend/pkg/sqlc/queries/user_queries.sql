-- name: CreateUser :one
INSERT INTO users (
  userId, email, firstName, lastName
) VALUES (
  ?, ?, ?, ?
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

-- name: GetSavedPostsByUserId :many
SELECT 
  s.savedPostId,
  s.postId,
  p.title,
  p.description,
  p.workSetup,
  o.company,
  jd.jobType,
  jd.salaryAmountMin,
  jd.salaryAmountMax,
  jd.salaryCurrency,
  jd.salaryType,
  a.country,
  a.city,
  COALESCE(GROUP_CONCAT(pt.tagName, ', '), '') AS tags,
  p.posted_at
FROM saved_posts s
LEFT JOIN posts p ON s.postId = p.postId
LEFT JOIN addresses a ON p.addressId = a.addressId
LEFT JOIN organizations o ON p.orgId = o.orgId
LEFT JOIN post_tags pt ON p.postId = pt.postId
LEFT JOIN job_details jd ON p.postId = jd.postId
WHERE s.userId = ?;