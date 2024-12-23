-- +goose Up
-- +goose StatementBegin
CREATE TABLE applications (
    applicationId TEXT NOT NULL PRIMARY KEY,
    resumeLink TEXT,
    status TEXT CHECK(status IN ('APPLIED', 'REVIEWED', 'SKIPPED', 'FOR_INTERVIEW', 'INTERVIEW', 'REJECTED_AFTER_INTERVIEW', 'JOB_OFFER', 'REJECTED_JOB_OFFER', 'ACCEPTED_JOB_OFFER', 'JOB_UNAVAILABLE')) NOT NULL,
    postId TEXT NOT NULL,
    userId TEXT NOT NULL,
    created_at DEFAULT CURRENT_TIMESTAMP,
    updated_at DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES posts(postId), 
    FOREIGN KEY (userId) REFERENCES users(userId)
);

CREATE INDEX idx_applications_postId ON applications(postId);
CREATE INDEX idx_applications_userId ON applications(userId);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX idx_applications_postId;
DROP INDEX idx_applications_userId;

DROP TABLE applications;
-- +goose StatementEnd
