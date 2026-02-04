# JoinWork - API Documentation

## Base URL
```
http://localhost:3000/api
```
*(Update based on chosen backend technology)*

## Authentication

All protected endpoints require an Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### POST /auth/login
Login user and get authentication token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "role": "graduate"
  }
}
```

### POST /auth/signup
Register a new user.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "graduate",
  "university": "University of Baghdad",
  "major": "Computer Science",
  "GPA": 3.5,
  "skills": "JavaScript, Python, React",
  "age": 23
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "user_id": 1,
    "email": "john@example.com",
    "role": "graduate"
  }
}
```

### GET /auth/me
Get current authenticated user information.

**Response:**
```json
{
  "user_id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "role": "graduate"
}
```

---

## Graduates Endpoints

### GET /graduates/:id
Get graduate profile by ID.

**Response:**
```json
{
  "graduate_id": 1,
  "user_id": 1,
  "university": "University of Baghdad",
  "major": "Computer Science",
  "GPA": 3.5,
  "skills": "JavaScript, Python, React",
  "age": 23,
  "projects": "...",
  "experience": "..."
}
```

### PUT /graduates/:id
Update graduate profile.

**Request Body:**
```json
{
  "university": "University of Baghdad",
  "major": "Computer Science",
  "GPA": 3.6,
  "skills": "JavaScript, Python, React, Node.js"
}
```

### GET /graduates/search
Search graduates by filters.

**Query Parameters:**
- `major` - Filter by major
- `skills` - Filter by skills (comma-separated)
- `min_gpa` - Minimum GPA
- `university` - Filter by university

**Response:**
```json
{
  "graduates": [
    {
      "graduate_id": 1,
      "full_name": "John Doe",
      "major": "Computer Science",
      "GPA": 3.5,
      "skills": "JavaScript, Python, React"
    }
  ],
  "total": 1
}
```

---

## Jobs Endpoints

### GET /jobs
Get all jobs with optional filters.

**Query Parameters:**
- `status` - Filter by status (active, closed, draft)
- `company_id` - Filter by company
- `skills` - Filter by required skills
- `location` - Filter by location
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "jobs": [
    {
      "job_id": 1,
      "company_id": 1,
      "title": "Software Developer",
      "description": "...",
      "salary": 500000,
      "skills_required": "JavaScript, React, Node.js",
      "location": "Baghdad",
      "employment_type": "full-time",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### GET /jobs/:id
Get job by ID.

### POST /jobs
Create a new job (Company only).

**Request Body:**
```json
{
  "title": "Software Developer",
  "description": "We are looking for...",
  "salary": 500000,
  "skills_required": "JavaScript, React, Node.js",
  "location": "Baghdad",
  "employment_type": "full-time"
}
```

### PUT /jobs/:id
Update job (Company only).

### DELETE /jobs/:id
Delete job (Company only).

### POST /jobs/:id/apply
Apply for a job (Graduate only).

**Request Body:**
```json
{
  "cover_letter": "I am interested in..."
}
```

### GET /jobs/:id/applications
Get applications for a job (Company only).

### POST /jobs/:id/save
Save job for later (Graduate only).

### GET /jobs/saved
Get saved jobs (Graduate only).

---

## Companies Endpoints

### GET /companies/:id
Get company profile.

### PUT /companies/:id
Update company profile.

### GET /companies/:id/jobs
Get all jobs posted by company.

---

## Workshops Endpoints

### GET /workshops
Get all workshops with optional filters.

**Query Parameters:**
- `category` - Filter by category
- `date_from` - Filter by start date
- `date_to` - Filter by end date

### GET /workshops/:id
Get workshop by ID.

### POST /workshops
Create workshop (Ministry only).

**Request Body:**
```json
{
  "title": "Web Development Workshop",
  "category": "Technology",
  "description": "...",
  "trainer": "Dr. Ahmed Ali",
  "date": "2024-02-01T10:00:00Z",
  "duration": 120,
  "max_participants": 50
}
```

### PUT /workshops/:id
Update workshop (Ministry only).

### DELETE /workshops/:id
Delete workshop (Ministry only).

### POST /workshops/:id/register
Register for workshop (Graduate only).

---

## Analytics Endpoints (Ministry Only)

### GET /analytics/graduates
Get graduate statistics.

**Response:**
```json
{
  "total_graduates": 1000,
  "employed_count": 650,
  "avg_gpa": 3.2,
  "unique_majors": 25,
  "unique_universities": 15
}
```

### GET /analytics/jobs
Get job statistics.

**Response:**
```json
{
  "total_jobs": 500,
  "active_jobs": 350,
  "total_applications": 2000,
  "avg_salary": 450000
}
```

### GET /analytics/skills-gap
Get skills gap analysis.

### GET /analytics/universities
Get university reports.

---

## CV Generator Endpoints

### GET /cv/generate/:graduate_id
Generate CV data for graduate.

**Response:**
```json
{
  "graduate": {
    "full_name": "John Doe",
    "major": "Computer Science",
    "GPA": 3.5,
    "skills": ["JavaScript", "Python", "React"],
    "projects": "...",
    "experience": "..."
  }
}
```

### GET /cv/export/:graduate_id
Export CV as PDF.

**Response:** PDF file download

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

