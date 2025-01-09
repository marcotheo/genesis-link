-- +goose Up
ALTER TABLE posts
ADD COLUMN embedding F32_BLOB(1536) NOT NULL;

CREATE INDEX posts_embedding_idx ON posts (libsql_vector_idx(embedding));

-- +goose Down
DROP INDEX posts_embedding_idx;

ALTER TABLE posts
DROP COLUMN embedding;
