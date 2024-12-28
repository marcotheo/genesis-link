-- +goose Up
-- Create the `user_skills` table
CREATE TABLE user_skills (
    skillId INTEGER PRIMARY KEY AUTOINCREMENT, 
    userId TEXT NOT NULL,                     
    skillName TEXT NOT NULL,                   
    skillLevel TEXT CHECK(skillLevel IN ('Beginner', 'Intermediate', 'Advanced')), 
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
