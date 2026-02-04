/**
 * JoinWork - Backend Server
 * Simple Express server for authentication and API endpoints
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'joinwork-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory database (replace with real database later)
let users = [];
let graduates = [];
let companies = [];
let jobs = [];
let applications = [];
let workshops = [];

// Helper function to generate JWT token
function generateToken(user) {
  return jwt.sign(
    { userId: user.user_id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Helper function to hash password
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Helper function to verify password
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: true, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: true, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { full_name, email, password, role, university, major, GPA, skills, age, company_name, sector, location, projects, experience } = req.body;

    // Validation
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ error: true, message: 'Missing required fields' });
    }

    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: true, message: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user_id = users.length + 1;
    const newUser = {
      user_id,
      full_name,
      email,
      password_hash: passwordHash,
      role,
      created_at: new Date().toISOString()
    };
    users.push(newUser);

    // Create role-specific profile
    if (role === 'graduate') {
      const graduate = {
        graduate_id: graduates.length + 1,
        user_id,
        university: university || '',
        major: major || '',
        GPA: GPA ? parseFloat(GPA) : null,
        skills: skills || '',
        age: age ? parseInt(age) : null,
        projects: projects || '',
        experience: experience || ''
      };
      graduates.push(graduate);
    } else if (role === 'company') {
      const company = {
        company_id: companies.length + 1,
        user_id,
        company_name: company_name || '',
        sector: sector || '',
        location: location || ''
      };
      companies.push(company);
    }

    // Generate token
    const token = generateToken(newUser);

    // Return response
    res.status(201).json({
      token,
      user: {
        user_id: newUser.user_id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: true, message: 'Email and password required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: true, message: 'Invalid email or password' });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: true, message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user);

    // Return response
    res.json({
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.user_id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: true, message: 'User not found' });
  }

  res.json({
    user_id: user.user_id,
    full_name: user.full_name,
    email: user.email,
    role: user.role
  });
});

// ============================================
// GRADUATES ENDPOINTS
// ============================================

// GET /api/graduates/:id
app.get('/api/graduates/:id', authenticateToken, (req, res) => {
  const graduate = graduates.find(g => g.graduate_id === parseInt(req.params.id));
  if (!graduate) {
    return res.status(404).json({ error: true, message: 'Graduate not found' });
  }

  const user = users.find(u => u.user_id === graduate.user_id);
  res.json({
    ...graduate,
    full_name: user ? user.full_name : '',
    email: user ? user.email : ''
  });
});

// ============================================
// JOBS ENDPOINTS
// ============================================

// GET /api/jobs
app.get('/api/jobs', (req, res) => {
  // Return jobs with company info
  const jobsWithCompany = jobs.map(job => {
    const company = companies.find(c => c.company_id === job.company_id);
    return {
      ...job,
      company_name: company ? company.company_name : 'Unknown Company'
    };
  });
  res.json({ jobs: jobsWithCompany, total: jobsWithCompany.length });
});

// ============================================
// WORKSHOPS ENDPOINTS
// ============================================

// GET /api/workshops
app.get('/api/workshops', (req, res) => {
  res.json({ workshops, total: workshops.length });
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'JoinWork API is running' });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: true, message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('  JoinWork - Backend Server');
  console.log('='.repeat(60));
  console.log(`  Server running on: http://localhost:${PORT}`);
  console.log(`  API Base URL: http://localhost:${PORT}/api`);
  console.log('='.repeat(60));
  console.log('\n  Endpoints available:');
  console.log('  - POST /api/auth/signup');
  console.log('  - POST /api/auth/login');
  console.log('  - GET  /api/auth/me');
  console.log('  - GET  /api/jobs');
  console.log('  - GET  /api/workshops');
  console.log('  - GET  /api/health');
  console.log('\n  Press Ctrl+C to stop the server\n');
});

