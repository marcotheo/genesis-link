CREATE TABLE users (
    userId TEXT NOT NULL PRIMARY KEY,
    email TEXT NOT NULL,
    mobileNumber TEXT,
    resumeLink TEXT,
    created_at DEFAULT CURRENT_TIMESTAMP,
    updated_at DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_skills (
    skillId TEXT NOT NULL PRIMARY KEY,
    userId TEXT NOT NULL,                     
    skillName TEXT NOT NULL,          
    skillLevel TEXT CHECK(skillLevel IN ('Beginner', 'Intermediate', 'Advanced')),
    skillCategory TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (userId) REFERENCES users(userId)
);

CREATE INDEX idx_user_skills_userId ON user_skills(userId);

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
CREATE INDEX idx_posts_userId ON posts(userId);
CREATE INDEX idx_posts_addressId ON posts(addressId);

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
CREATE INDEX idx_job_details_postId ON job_details(postId);

CREATE TABLE post_requirements (
    requirementId TEXT NOT NULL PRIMARY KEY,
    postId TEXT NOT NULL,
    requirementType TEXT CHECK(requirementType IN ('responsibility', 'qualification')) NOT NULL,
    requirement TEXT NOT NULL,
    FOREIGN KEY (postId) REFERENCES posts(postId)
);

CREATE INDEX idx_post_requirements_postId ON post_requirements(postId);

CREATE TABLE applications (
    applicationId TEXT NOT NULL PRIMARY KEY,
    resumeLink TEXT,
    status TEXT CHECK(status IN ('APPLIED', 'REVIEWED', 'SKIPPED', 'FOR_INTERVIEW', 'INTERVIEW', 'REJECTED_AFTER_INTERVIEW', 'JOB_OFFER', 'REJECTED_JOB_OFFER', 'ACCEPTED_JOB_OFFER', 'JOB_UNAVAILABLE')) NOT NULL,
    postId TEXT NOT NULL,
    userId TEXT NOT NULL,
    created_at DEFAULT CURRENT_TIMESTAMP,
    updated_at DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES posts(postId), 
    FOREIGN KEY (userId) REFERENCES users(userId)
)

CREATE INDEX idx_applications_postId ON applications(postId);
CREATE INDEX idx_applications_userId ON applications(userId);