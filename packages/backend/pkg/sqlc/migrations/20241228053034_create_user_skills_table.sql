-- +goose Up
-- Create the `user_skills` table
CREATE TABLE user_skills (
    skillId TEXT NOT NULL PRIMARY KEY,
    userId TEXT NOT NULL,                     
    skillName TEXT NOT NULL,                   
    skillLevel TEXT CHECK(skillLevel IN ('beginner', 'intermediate', 'advanced')),
    skillCategory TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (userId) REFERENCES users(userId)  
);

-- Create an index on userId to optimize foreign key lookups
CREATE INDEX idx_user_skills_userId ON user_skills(userId);

-- +goose Down
-- Drop the index and table
DROP INDEX IF EXISTS idx_user_skills_userId;
DROP TABLE IF EXISTS user_skills;
