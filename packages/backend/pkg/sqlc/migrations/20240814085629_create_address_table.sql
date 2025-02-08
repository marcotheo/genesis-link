-- +goose Up
-- +goose StatementBegin
CREATE TABLE addresses (
    addressId TEXT NOT NULL PRIMARY KEY,
    country TEXT NOT NULL DEFAULT 'Philippines',
    region TEXT,
    province TEXT,
    city TEXT,
    barangay TEXT,
    addressDetails TEXT,  -- House number, unit, building, street, etc.
    orgId TEXT NOT NULL,  -- Define orgId column
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    FOREIGN KEY (orgId) REFERENCES organizations(orgId)
);

CREATE INDEX idx_address ON addresses(country, province, city);
CREATE INDEX idx_address_orgId ON addresses(orgId);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_address;
DROP INDEX IF EXISTS idx_address_orgId;

DROP TABLE IF EXISTS addresses;
-- +goose StatementEnd
