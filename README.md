# JoinWork - Graduate Employment & Training System

A comprehensive digital platform connecting Iraqi graduates with job opportunities, training programs, and helping companies and the Ministry access graduate information.

## 🎯 Project Purpose

The platform connects:
- **Graduates** → to job opportunities, training, workshops
- **Companies** → to skilled graduates
- **Ministry/Universities** → to analytics about employment & training

The system automatically generates professional CVs based on user data.

## 🏗️ Project Structure

```
Graduate Employment/
├── frontend/
│   ├── pages/
│   │   ├── login.html
│   │   ├── signup.html
│   │   ├── dashboard.html
│   │   ├── jobs.html
│   │   ├── company-portal.html
│   │   ├── ministry-portal.html
│   │   ├── workshops.html
│   │   └── profile.html
│   ├── css/
│   │   ├── theme.css          # Design system & theme variables
│   │   ├── components.css     # Reusable components
│   │   └── main.css           # Global styles
│   ├── js/
│   │   ├── auth.js
│   │   ├── api.js
│   │   ├── cv-generator.js
│   │   └── utils.js
│   └── assets/
│       └── images/
├── backend/
│   ├── [to be determined: ASP.NET Core / Node.js / FastAPI]
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── utils/
├── database/
│   ├── schema.sql
│   └── migrations/
└── docs/
    └── API.md
```

## 🎨 Design System

### Color Palette
- **Primary**: `rgb(74, 144, 226)` - #4A90E2
- **Secondary**: `rgb(80, 227, 194)` - #50E3C2
- **Dark Text**: `rgb(51, 51, 51)` - #333333
- **Light Background**: `rgb(245, 247, 250)` - #F5F7FA

### Typography
- Consistent font families and sizes across all pages
- Clear hierarchy: headings, body text, labels

### Components
- Unified header/footer
- Card components
- Buttons (primary, secondary, outline)
- Input fields
- Grid layouts
- Consistent spacing and padding

## 📋 Features

### Graduate Features
- Create/Update profile
- Auto-generated CV (PDF export)
- Apply for jobs
- Join workshops
- Save jobs

### Company Features
- Post jobs
- Manage applications
- Search graduates by skills/major

### Ministry Features
- View analytics dashboards
- Manage workshops (CRUD)
- Access reports

## 🗄️ Database Schema

### Tables
- **Users** (user_id, full_name, email, password_hash, role)
- **Graduates** (graduate_id, university, major, GPA, skills, age)
- **Companies** (company_id, company_name, sector, location)
- **Jobs** (job_id, company_id, title, description, salary, skills_required, created_at)
- **Applications** (application_id, job_id, graduate_id, status, date)
- **Workshops** (workshop_id, title, category, description, date)

## 🚀 Getting Started

### Prerequisites
- Backend technology: [To be determined]
- Database: [To be determined]
- Web server or development environment

### Installation
1. Clone the repository
2. Set up backend (instructions to be added based on chosen technology)
3. Configure database connection
4. Run migrations
5. Start the development server

## 📝 Development Guidelines

- Use clean, readable naming conventions
- Follow the design system strictly
- Ensure responsive design
- Add comments explaining logic
- Maintain consistent code structure
- Follow security best practices

## 🔐 Security

- Authentication: JWT or session-based
- Password hashing
- Input validation
- SQL injection prevention
- XSS protection

## 📄 License

[To be determined]

