------- START

-- USER TABLE

CREATE TABLE users (
    userId UUID NOT NULL PRIMARY KEY,
    email TEXT NOT NULL,
    created_at DEFAULT CURRENT_TIMESTAMP,
    updated_at DEFAULT CURRENT_TIMESTAMP
);

-- POST TABLE

CREATE TABLE posts (
    postId TEXT NOT NULL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    postType TEXT CHECK(postType IN ('job', 'volunteer')) NOT NULL,
    jobType TEXT CHECK(jobType IN ('full-time', 'part-time', 'contract', 'internship')) NULL,
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

CREATE INDEX idx_postType ON posts(postType);
CREATE INDEX idx_jobType ON posts(jobType);
CREATE INDEX idx_wfh ON posts(wfh);
CREATE INDEX idx_location ON posts(location);
CREATE INDEX idx_posted_at ON posts(posted_at);

------- END