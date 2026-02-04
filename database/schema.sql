-- JoinWork - Database Schema
-- Graduate Employment & Training System

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('graduate', 'company', 'ministry') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- ============================================
-- GRADUATES TABLE
-- ============================================
CREATE TABLE Graduates (
    graduate_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    university VARCHAR(255) NOT NULL,
    major VARCHAR(255) NOT NULL,
    GPA DECIMAL(3, 2) CHECK (GPA >= 0 AND GPA <= 4.0),
    skills TEXT,
    age INT,
    projects TEXT,
    experience TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    INDEX idx_major (major),
    INDEX idx_university (university),
    INDEX idx_gpa (GPA)
);

-- ============================================
-- COMPANIES TABLE
-- ============================================
CREATE TABLE Companies (
    company_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    sector VARCHAR(255),
    location VARCHAR(255),
    description TEXT,
    website VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    INDEX idx_sector (sector),
    INDEX idx_location (location)
);

-- ============================================
-- JOBS TABLE
-- ============================================
CREATE TABLE Jobs (
    job_id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    salary DECIMAL(10, 2),
    skills_required TEXT,
    location VARCHAR(255),
    employment_type ENUM('full-time', 'part-time', 'contract', 'internship') DEFAULT 'full-time',
    status ENUM('active', 'closed', 'draft') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES Companies(company_id) ON DELETE CASCADE,
    INDEX idx_company (company_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FULLTEXT INDEX idx_search (title, description, skills_required)
);

-- ============================================
-- APPLICATIONS TABLE
-- ============================================
CREATE TABLE Applications (
    application_id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    graduate_id INT NOT NULL,
    status ENUM('pending', 'reviewed', 'accepted', 'rejected') DEFAULT 'pending',
    cover_letter TEXT,
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_date TIMESTAMP NULL,
    FOREIGN KEY (job_id) REFERENCES Jobs(job_id) ON DELETE CASCADE,
    FOREIGN KEY (graduate_id) REFERENCES Graduates(graduate_id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (job_id, graduate_id),
    INDEX idx_job (job_id),
    INDEX idx_graduate (graduate_id),
    INDEX idx_status (status),
    INDEX idx_applied_date (applied_date)
);

-- ============================================
-- WORKSHOPS TABLE
-- ============================================
CREATE TABLE Workshops (
    workshop_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    description TEXT,
    trainer VARCHAR(255),
    date DATETIME NOT NULL,
    duration INT, -- in minutes
    max_participants INT,
    created_by INT, -- ministry user_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Users(user_id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_date (date),
    INDEX idx_created_by (created_by)
);

-- ============================================
-- WORKSHOP REGISTRATIONS TABLE
-- ============================================
CREATE TABLE WorkshopRegistrations (
    registration_id INT PRIMARY KEY AUTO_INCREMENT,
    workshop_id INT NOT NULL,
    graduate_id INT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attended BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (workshop_id) REFERENCES Workshops(workshop_id) ON DELETE CASCADE,
    FOREIGN KEY (graduate_id) REFERENCES Graduates(graduate_id) ON DELETE CASCADE,
    UNIQUE KEY unique_registration (workshop_id, graduate_id),
    INDEX idx_workshop (workshop_id),
    INDEX idx_graduate (graduate_id)
);

-- ============================================
-- SAVED JOBS TABLE (for graduates)
-- ============================================
CREATE TABLE SavedJobs (
    saved_job_id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    graduate_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES Jobs(job_id) ON DELETE CASCADE,
    FOREIGN KEY (graduate_id) REFERENCES Graduates(graduate_id) ON DELETE CASCADE,
    UNIQUE KEY unique_saved_job (job_id, graduate_id),
    INDEX idx_job (job_id),
    INDEX idx_graduate (graduate_id)
);

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- View: Graduate Statistics
CREATE VIEW GraduateStats AS
SELECT 
    COUNT(DISTINCT g.graduate_id) AS total_graduates,
    COUNT(DISTINCT CASE WHEN a.status = 'accepted' THEN a.application_id END) AS employed_count,
    AVG(g.GPA) AS avg_gpa,
    COUNT(DISTINCT g.major) AS unique_majors,
    COUNT(DISTINCT g.university) AS unique_universities
FROM Graduates g
LEFT JOIN Applications a ON g.graduate_id = a.graduate_id;

-- View: Job Statistics
CREATE VIEW JobStats AS
SELECT 
    COUNT(DISTINCT j.job_id) AS total_jobs,
    COUNT(DISTINCT CASE WHEN j.status = 'active' THEN j.job_id END) AS active_jobs,
    COUNT(DISTINCT a.application_id) AS total_applications,
    AVG(j.salary) AS avg_salary
FROM Jobs j
LEFT JOIN Applications a ON j.job_id = a.job_id;

-- View: Skills Gap Analysis
CREATE VIEW SkillsGap AS
SELECT 
    j.skills_required,
    COUNT(DISTINCT j.job_id) AS job_count,
    COUNT(DISTINCT a.application_id) AS application_count
FROM Jobs j
LEFT JOIN Applications a ON j.job_id = a.job_id
WHERE j.status = 'active'
GROUP BY j.skills_required;

