-- +goose Up
-- +goose StatementBegin
CREATE TABLE job_details (
    jobDetailId TEXT NOT NULL PRIMARY KEY,
    postId TEXT NOT NULL,
    jobType TEXT CHECK(jobType IN ('full-time', 'part-time', 'contract', 'internship')) NOT NULL,
    salaryType TEXT CHECK(salaryType IN ('fixed', 'hourly', 'monthly')) NULL, 
    salaryAmountMin INTEGER,
    salaryAmountMax INTEGER,
    salaryCurrency TEXT DEFAULT 'PHP',
    FOREIGN KEY (postId) REFERENCES posts(postId) 
);

CREATE INDEX idx_jobType ON job_details(jobType);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX idx_jobType;

DROP TABLE job_details;
-- +goose StatementEnd
