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
    userId TEXT,  -- Define userId column
    FOREIGN KEY (userId) REFERENCES users(userId)
);

CREATE INDEX idx_address ON addresses(country, province, city);
CREATE INDEX idx_address_userId ON addresses(userId);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_address;
DROP INDEX IF EXISTS idx_address_userId;

DROP TABLE IF EXISTS addresses;
-- +goose StatementEnd
