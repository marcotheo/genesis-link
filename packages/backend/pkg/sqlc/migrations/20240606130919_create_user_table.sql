-- +goose Up
-- +goose StatementBegin
CREATE TABLE users (
    userId TEXT NOT NULL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    mobileNumber TEXT,
    resumeLink TEXT,
    google_id TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE users;
-- +goose StatementEnd
