-- +goose Up
-- +goose StatementBegin
CREATE TABLE posts (
    postId TEXT NOT NULL PRIMARY KEY,
    company TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    posterLink TEXT,
    logoLink TEXT,
    additionalInfoLink TEXT,
    wfh INTEGER DEFAULT 0,
    email TEXT,
    phone TEXT,
    deadline INTEGER,
    addressId TEXT NOT NULL,
    userId TEXT NOT NULL,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(userId),
    FOREIGN KEY (addressId) REFERENCES addresses(addressId)
);

CREATE INDEX idx_title ON posts(title);
CREATE INDEX idx_wfh ON posts(wfh);
CREATE INDEX idx_posted_at ON posts(posted_at);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX idx_title;
DROP INDEX idx_wfh;
DROP INDEX idx_posted_at;

DROP TABLE posts;
-- +goose StatementEnd
