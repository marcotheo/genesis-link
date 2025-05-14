-- +goose Up
-- +goose StatementBegin
CREATE TABLE organizations (
    orgId TEXT NOT NULL PRIMARY KEY,
    company TEXT NOT NULL,
    email TEXT NOT NULL,
    contactNumber TEXT,
    bannerLink TEXT,
    logoLink TEXT,
    userId TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_organizations_userId ON organizations(userId);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_organizations_userId;

DROP TABLE organizations;
-- +goose StatementEnd
