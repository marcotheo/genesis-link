-- +goose Up
CREATE TABLE saved_posts (
    savedJobId TEXT NOT NULL PRIMARY KEY,
    postId TEXT NOT NULL,
    userId TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES posts(postId),
    FOREIGN KEY (userId) REFERENCES users(userId)
);

CREATE INDEX idx_saved_posts_postId ON saved_posts(postId);
CREATE INDEX idx_saved_posts_userId ON saved_posts(userId);

-- +goose Down
DROP INDEX IF EXISTS idx_saved_posts_userId;
DROP INDEX IF EXISTS idx_saved_posts_postId;
DROP TABLE IF EXISTS saved_posts;
