-- +goose Up
-- +goose StatementBegin
CREATE TABLE job_details (
    jobDetailId TEXT NOT NULL PRIMARY KEY,
    postId TEXT NOT NULL,
    jobType TEXT CHECK(jobType IN ('full-time', 'part-time', 'contract', 'internship')) NOT NULL,
    salaryType TEXT CHECK(salaryType IN ('fixed', 'hourly', 'monthly')),
    salaryAmountMin INTEGER,
    salaryAmountMax INTEGER,
    salaryCurrency TEXT DEFAULT 'PHP',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    FOREIGN KEY (postId) REFERENCES posts(postId)
);

CREATE INDEX idx_jobType ON job_details(jobType);
CREATE INDEX idx_job_details_postId ON job_details(postId);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX idx_jobType;
DROP INDEX idx_job_details_postId;

DROP TABLE job_details;
-- +goose StatementEnd
