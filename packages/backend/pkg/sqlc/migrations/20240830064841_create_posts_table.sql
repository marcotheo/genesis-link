-- +goose Up
-- +goose StatementBegin
CREATE TABLE posts (
    postId TEXT NOT NULL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    additionalInfoLink TEXT,
    wfh INTEGER DEFAULT 0,
    deadline INTEGER,
    embedding F32_BLOB(1536) NOT NULL,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    addressId TEXT NOT NULL,
    orgId TEXT NOT NULL,
    FOREIGN KEY (orgId) REFERENCES organizations(orgId),
    FOREIGN KEY (addressId) REFERENCES addresses(addressId)
);

CREATE INDEX posts_embedding_idx ON posts(libsql_vector_idx(embedding));
CREATE INDEX idx_posted_at ON posts(posted_at);
CREATE INDEX idx_wfh ON posts(wfh);
CREATE INDEX idx_posts_orgId ON posts(orgId);
CREATE INDEX idx_posts_addressId ON posts(addressId);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX posts_embedding_idx;
DROP INDEX idx_posted_at;
DROP INDEX idx_wfh;
DROP INDEX idx_posts_orgId;
DROP INDEX idx_posts_addressId;

DROP TABLE posts;
-- +goose StatementEnd
