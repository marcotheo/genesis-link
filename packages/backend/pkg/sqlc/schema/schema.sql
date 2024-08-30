CREATE TABLE users (
    userId TEXT NOT NULL PRIMARY KEY,
    email TEXT NOT NULL,
    created_at DEFAULT CURRENT_TIMESTAMP,
    updated_at DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    postId TEXT NOT NULL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    postType TEXT CHECK(postType IN ('job', 'volunteer')) NOT NULL,
    jobType TEXT CHECK(jobType IN ('full-time', 'part-time', 'contract', 'internship')),
    company TEXT,
    salary INTEGER,
    wfh INTEGER DEFAULT 0,
    email TEXT,
    phone TEXT,
    deadline INTEGER,
    addressId TEXT,
    userId TEXT NOT NULL,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(userId),
    FOREIGN KEY (addressId) REFERENCES addresses(addressId)
);

CREATE INDEX idx_postType ON posts(postType);
CREATE INDEX idx_jobType ON posts(jobType);
CREATE INDEX idx_wfh ON posts(wfh);
CREATE INDEX idx_posted_at ON posts(posted_at);

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


