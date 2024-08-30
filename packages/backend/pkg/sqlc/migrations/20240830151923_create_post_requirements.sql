-- +goose Up
-- +goose StatementBegin
CREATE TABLE post_requirements (
    jobDetailId TEXT NOT NULL PRIMARY KEY,
    postId TEXT NOT NULL,
    jobType TEXT CHECK(jobType IN ('full-time', 'part-time', 'contract', 'internship')) NOT NULL,
    salaryType TEXT CHECK(salaryType IN ('fixed', 'hourly', 'monthly')) NULL, 
    salaryAmountMin INTEGER,
    salaryAmountMax INTEGER,
    salaryCurrency TEXT DEFAULT 'PHP',
    FOREIGN KEY (postId) REFERENCES posts(postId) 
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE post_requirements;
-- +goose StatementEnd
