-- +goose Up
-- +goose StatementBegin
ALTER TABLE applications RENAME TO applications_old;

CREATE TABLE applications (
    applicationId TEXT NOT NULL PRIMARY KEY,
    proposalLink TEXT,
    status TEXT CHECK(status IN ('APPLIED', 'REVIEWED', 'SKIPPED', 'FOR_INTERVIEW', 'INTERVIEW', 'REJECTED_AFTER_INTERVIEW', 'JOB_OFFER', 'REJECTED_JOB_OFFER', 'ACCEPTED_JOB_OFFER', 'JOB_UNAVAILABLE')) NOT NULL,
    postId TEXT NOT NULL,
    userId TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES posts(postId),
    FOREIGN KEY (userId) REFERENCES users(userId)
);

INSERT INTO applications (
    applicationId, proposalLink, status, postId, userId, created_at, updated_at
)
SELECT
    applicationId, proposalLink, status, postId, userId, created_at, updated_at
FROM applications_old;

DROP TABLE applications_old;

CREATE INDEX idx_applications_postId ON applications(postId);
CREATE INDEX idx_applications_userId ON applications(userId);
CREATE UNIQUE INDEX idx_applications_post_user_unique ON applications(postId, userId);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE applications RENAME TO applications_new;

CREATE TABLE applications (
    applicationId TEXT NOT NULL PRIMARY KEY,
    proposalLink TEXT,
    status TEXT CHECK(status IN ('APPLIED', 'REVIEWED', 'SKIPPED', 'FOR_INTERVIEW', 'INTERVIEW', 'REJECTED_AFTER_INTERVIEW', 'JOB_OFFER', 'REJECTED_JOB_OFFER', 'ACCEPTED_JOB_OFFER', 'JOB_UNAVAILABLE')) NOT NULL,
    postId TEXT NOT NULL,
    userId TEXT NOT NULL,
    created_at DEFAULT CURRENT_TIMESTAMP,
    updated_at DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES posts(postId),
    FOREIGN KEY (userId) REFERENCES users(userId)
);

INSERT INTO applications (
    applicationId, proposalLink, status, postId, userId, created_at, updated_at
)
SELECT
    applicationId, proposalLink, status, postId, userId, created_at, updated_at
FROM applications_new;

DROP TABLE applications_new;

CREATE INDEX idx_applications_postId ON applications(postId);
CREATE INDEX idx_applications_userId ON applications(userId);
CREATE UNIQUE INDEX idx_applications_post_user_unique ON applications(postId, userId);
-- +goose StatementEnd
