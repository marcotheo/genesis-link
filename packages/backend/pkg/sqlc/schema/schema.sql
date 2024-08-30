CREATE TABLE users (
    userId TEXT NOT NULL PRIMARY KEY,
    email TEXT NOT NULL,
    created_at DEFAULT CURRENT_TIMESTAMP,
    updated_at DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE addresses (
    addressId TEXT NOT NULL PRIMARY KEY,
    country TEXT NOT NULL DEFAULT 'Philippines',
    region TEXT,
    province TEXT,
    city TEXT,
    barangay TEXT,
    addressDetails TEXT
);

CREATE INDEX idx_address ON addresses(country, province, city);

CREATE TABLE posts (
    postId TEXT NOT NULL PRIMARY KEY,
    company TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    posterLink TEXT,
    logoLink TEXT,
    additionalInfoLink TEXT,
    wfh INTEGER DEFAULT 0,
    email TEXT,
    phone TEXT,
    deadline INTEGER,
    addressId TEXT NOT NULL,
    userId TEXT NOT NULL,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(userId),
    FOREIGN KEY (addressId) REFERENCES addresses(addressId)
);

CREATE INDEX idx_title ON posts(title);
CREATE INDEX idx_wfh ON posts(wfh);
CREATE INDEX idx_posted_at ON posts(posted_at);

CREATE TABLE job_details (
    jobDetailId TEXT NOT NULL PRIMARY KEY,
    postId TEXT NOT NULL,
    jobType TEXT CHECK(jobType IN ('full-time', 'part-time', 'contract', 'internship')) NOT NULL,
    salaryType TEXT CHECK(salaryType IN ('fixed', 'hourly', 'monthly')), 
    salaryAmountMin INTEGER,
    salaryAmountMax INTEGER,
    salaryCurrency TEXT DEFAULT 'PHP',
    FOREIGN KEY (postId) REFERENCES posts(postId) 
);

CREATE INDEX idx_jobType ON job_details(jobType);

CREATE TABLE post_requirements (
    requirementId TEXT NOT NULL PRIMARY KEY,
    postId TEXT NOT NULL,
    requirementType TEXT CHECK(requirementType IN ('responsibility', 'qualification')) NOT NULL,
    requirement TEXT NOT NULL,
    FOREIGN KEY (postId) REFERENCES posts(postId)
);



