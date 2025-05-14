-- +goose Up
-- +goose StatementBegin
CREATE TABLE posts (
    postId TEXT NOT NULL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    additionalInfoLink TEXT,
    workSetup TEXT CHECK(workSetup IN ('remote', 'on-site', 'hybrid')) NOT NULL, 
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
CREATE INDEX idx_posted_at_idx ON posts(posted_at);
CREATE INDEX idx_workSetup_idx ON posts(workSetup);
CREATE INDEX idx_posts_orgId_idx ON posts(orgId);
CREATE INDEX idx_posts_addressId_idx ON posts(addressId);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX posts_embedding_idx;
DROP INDEX idx_posted_at_idx;
DROP INDEX idx_workSetup_idx;
DROP INDEX idx_posts_orgId_idx;
DROP INDEX idx_posts_addressId_idx;

DROP TABLE posts;
-- +goose StatementEnd
