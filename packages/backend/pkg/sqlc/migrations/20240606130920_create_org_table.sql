-- +goose Up
-- +goose StatementBegin
CREATE TABLE organizations (
    orgId TEXT NOT NULL PRIMARY KEY,
    company TEXT NOT NULL,
    email TEXT NOT NULL,
    mobileNumber TEXT,
    posterLink TEXT,
    logoLink TEXT,
    created_at DEFAULT CURRENT_TIMESTAMP,
    updated_at DEFAULT CURRENT_TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE organizations;
-- +goose StatementEnd
