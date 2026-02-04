# Backend Setup - JoinWork

## ✅ Backend Created!

I've created a **Python Flask backend** that will handle your signup and login requests.

## 🚀 How to Start the Backend

### Option 1: Double-Click Batch File (Easiest)
**Double-click `START_BACKEND_PYTHON.bat`** in the project root folder.

### Option 2: Manual Start
1. Open Command Prompt or PowerShell in the project folder
2. Navigate to backend: `cd backend`
3. Install dependencies: `pip install -r requirements.txt`
4. Start server: `python app.py`

## 📍 What You'll See

When the backend starts, you'll see:
```
============================================================
  JoinWork - Backend Server (Python Flask)
============================================================
  Server running on: http://localhost:3000
  API Base URL: http://localhost:3000/api
============================================================
```

## ✅ Then Try Signup Again

1. **Keep the backend server running** (don't close the window)
2. **Open your browser** to the signup page
3. **Fill the form** and submit
4. **It should work now!** ✅

## 🔧 What the Backend Does

- ✅ Handles user signup (Graduate, Company, Ministry)
- ✅ Handles user login
- ✅ Stores user data in memory (for now)
- ✅ Generates JWT tokens for authentication
- ✅ Validates passwords and emails
- ✅ Returns proper success/error messages

## 📝 Current Features

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Other Endpoints
- `GET /api/jobs` - Get all jobs
- `GET /api/workshops` - Get all workshops
- `GET /api/health` - Health check

## ⚠️ Important Notes

1. **Data is stored in memory** - When you restart the server, all data is lost
2. **This is for development** - In production, you'll need a real database
3. **Keep the server running** - The frontend needs the backend to be running

## 🐛 Troubleshooting

### "Module not found" error
Run: `pip install -r backend/requirements.txt`

### "Port 3000 already in use"
- Close any other application using port 3000
- Or edit `backend/app.py` and change `port=3000` to another port

### Still getting "Failed to fetch"
- Make sure the backend server is running
- Check the browser console for the exact error
- Verify the API URL in `frontend/js/api.js` is `http://localhost:3000/api`

## 🎯 Next Steps

Once the backend is running:
1. Try signing up again - it should work!
2. Try logging in with your new account
3. Tell me what other features you want to add!

