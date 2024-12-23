-- +goose Up
-- Add the new column resumeLink to the users table
ALTER TABLE users ADD COLUMN resumeLink TEXT;
ALTER TABLE users ADD COLUMN mobileNumber TEXT;

-- +goose Down
-- Remove the resumeLink column from the users table
ALTER TABLE users DROP COLUMN resumeLink;
ALTER TABLE users DROP COLUMN mobileNumber;
