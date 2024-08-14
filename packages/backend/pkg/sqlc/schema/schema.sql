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
    location TEXT,
    salary TEXT,
    wfh INTEGER DEFAULT 0,
    email TEXT,
    phone TEXT,
    deadline DATE,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);