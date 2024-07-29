-- +goose Up
ALTER TABLE users ADD COLUMN password VARCHAR(255);
ALTER TABLE users ADD COLUMN salt VARCHAR(255);

-- +goose Down
ALTER TABLE users DROP COLUMN password;
ALTER TABLE users DROP COLUMN salt;
