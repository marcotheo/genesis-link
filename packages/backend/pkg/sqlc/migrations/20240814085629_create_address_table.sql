-- +goose Up
-- +goose StatementBegin
CREATE TABLE addresses (
    addressId TEXT NOT NULL PRIMARY KEY,
    country TEXT NOT NULL DEFAULT 'Philippines',
    region TEXT,
    province TEXT,
    city TEXT,
    barangay TEXT,
    addressDetails TEXT  -- House number, unit, building, street, etc.
);

CREATE INDEX idx_address ON addresses(country, province, city);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX idx_address;

DROP TABLE addresses;
-- +goose StatementEnd
