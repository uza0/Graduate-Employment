# JoinWork - Project Structure

## Directory Overview

```
Graduate Employment/
├── frontend/                    # Frontend application
│   ├── pages/                   # HTML pages
│   │   ├── login.html
│   │   ├── signup.html
│   │   ├── dashboard.html
│   │   ├── jobs.html
│   │   ├── company-portal.html
│   │   ├── ministry-portal.html
│   │   ├── workshops.html
│   │   └── profile.html
│   ├── css/                     # Stylesheets
│   │   ├── theme.css           # Design system & variables
│   │   ├── components.css      # Reusable components
│   │   └── main.css            # Main stylesheet (imports others)
│   ├── js/                      # JavaScript files
│   │   ├── api.js              # API client functions
│   │   ├── auth.js             # Authentication logic
│   │   ├── cv-generator.js     # CV generation logic
│   │   └── utils.js            # Utility functions
│   ├── components/              # Reusable HTML components
│   │   ├── header.html
│   │   └── footer.html
│   └── assets/                  # Static assets
│       └── images/
│
├── backend/                     # Backend application
│   ├── [ASP.NET Core / Node.js / FastAPI]
│   ├── models/                  # Data models
│   ├── routes/                  # API routes
│   ├── middleware/              # Middleware functions
│   ├── utils/                   # Utility functions
│   └── config/                  # Configuration files
│
├── database/                     # Database files
│   ├── schema.sql               # Database schema
│   └── migrations/              # Database migrations
│
├── docs/                        # Documentation
│   └── API.md                   # API documentation
│
├── README.md                    # Project overview
├── PROJECT_STRUCTURE.md         # This file
└── .gitignore                   # Git ignore rules
```

## File Descriptions

### Frontend

#### Pages
- **login.html** - User login page
- **signup.html** - User registration page
- **dashboard.html** - Graduate home page with profile, CV preview, recommended jobs
- **jobs.html** - Job listings page
- **company-portal.html** - Company dashboard for posting jobs and managing applications
- **ministry-portal.html** - Ministry dashboard for analytics and workshop management
- **workshops.html** - Workshop listings page
- **profile.html** - User profile page with CV generator

#### CSS
- **theme.css** - Design system with color variables, typography, spacing, shadows
- **components.css** - Reusable component styles (buttons, cards, inputs, header, footer)
- **main.css** - Main stylesheet that imports theme and components

#### JavaScript
- **api.js** - Centralized API client with all endpoint functions
- **auth.js** - Authentication and session management
- **cv-generator.js** - CV generation and PDF export logic
- **utils.js** - Helper functions (date formatting, validation, etc.)

### Backend

Structure will be determined based on chosen technology:
- **ASP.NET Core**: Controllers, Models, Services, Data Context
- **Node.js/Express**: Routes, Models, Controllers, Middleware
- **Python/FastAPI**: Routes, Models, Services, Dependencies

### Database

- **schema.sql** - Complete database schema with all tables, relationships, indexes, and views
- **migrations/** - Database migration files (if using migration system)

## Design System

### Colors
- Primary: `rgb(74, 144, 226)` - #4A90E2
- Secondary: `rgb(80, 227, 194)` - #50E3C2
- Dark Text: `rgb(51, 51, 51)` - #333333
- Light Background: `rgb(245, 247, 250)` - #F5F7FA

### Components
All pages must use:
- Unified header and footer
- Consistent button styles
- Card components for content
- Form inputs with validation
- Responsive grid layouts

## Development Workflow

1. **Create a new page**: Add HTML file in `frontend/pages/`
2. **Add styles**: Use existing CSS variables and components
3. **Add functionality**: Use API client from `frontend/js/api.js`
4. **Backend endpoint**: Add route in `backend/routes/`
5. **Database changes**: Update `database/schema.sql` and create migration

## Next Steps

When implementing features:
1. Follow the design system strictly
2. Use the API client for all backend communication
3. Ensure responsive design
4. Add proper error handling
5. Include comments explaining logic

