-- +goose Up
CREATE TABLE saved_posts (
    savedPostId TEXT NOT NULL PRIMARY KEY,
    postId TEXT NOT NULL,
    userId TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES posts(postId),
    FOREIGN KEY (userId) REFERENCES users(userId)
);

CREATE UNIQUE INDEX idx_saved_posts_user_post ON saved_posts(userId, postId);

-- +goose Down
DROP INDEX IF EXISTS idx_saved_posts_user_post;
DROP TABLE IF EXISTS saved_posts;
