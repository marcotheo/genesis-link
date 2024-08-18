-- +goose Up
-- +goose StatementBegin
CREATE TABLE posts (
    postId TEXT NOT NULL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    postType TEXT CHECK(postType IN ('job', 'volunteer')) NOT NULL,
    jobType TEXT CHECK(jobType IN ('full-time', 'part-time', 'contract', 'internship')) NULL,
    company TEXT,
    location TEXT,
    salary INTEGER,
    wfh INTEGER DEFAULT 0,
    email TEXT,
    phone TEXT,
    deadline INTEGER,
    userId TEXT NOT NULL,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(userId)
);

CREATE INDEX idx_postType ON posts(postType);
CREATE INDEX idx_jobType ON posts(jobType);
CREATE INDEX idx_wfh ON posts(wfh);
CREATE INDEX idx_location ON posts(location);
CREATE INDEX idx_posted_at ON posts(posted_at);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX idx_postType;
DROP INDEX idx_jobType;
DROP INDEX idx_wfh;
DROP INDEX idx_location;
DROP INDEX idx_posted_at;

DROP TABLE posts;
-- +goose StatementEnd
