-- +goose Up
-- Create the `post_tags` table
CREATE TABLE post_tags (
    tagId TEXT NOT NULL PRIMARY KEY,
    postId TEXT NOT NULL,                     
    tagName TEXT NOT NULL,
    tagCategory TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (postId) REFERENCES posts(postId)
);

-- Create an index on postId to optimize foreign key lookups
CREATE INDEX idx_posts_tags_postId ON post_tags(postId);

-- +goose Down
-- Drop the index and table
DROP INDEX IF EXISTS idx_posts_tags_postId;
DROP TABLE IF EXISTS post_tags;
