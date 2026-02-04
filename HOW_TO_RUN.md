# How to Run JoinWork

## Quick Start

### Option 1: Using the Batch File (Easiest)
Double-click `START_SERVER.bat` - it will automatically use Python or Node.js if available.

### Option 2: Using Python (Recommended if Python is installed)
```bash
python start-server.py
```

### Option 3: Using Node.js (If Node.js is installed)
```bash
node server.js
```

### Option 4: Open Directly in Browser
Simply open `frontend/index.html` in your web browser.
**Note:** API calls won't work without a backend server, but you can see the UI.

## Access the Application

Once the server is running, open your browser and navigate to:
```
http://localhost:3000
```

## Prerequisites

You need one of the following installed:
- **Python 3.x** - Download from https://www.python.org/downloads/
- **Node.js** - Download from https://nodejs.org/

## Troubleshooting

### Port Already in Use
If you see "Port 3000 is already in use":
- Close any other applications using port 3000
- Or edit `start-server.py` or `server.js` to change the PORT number

### API Calls Not Working
The frontend is set up, but you'll need to:
1. Choose a backend technology (ASP.NET Core, Node.js/Express, or Python/FastAPI)
2. Set up the backend server
3. Update `API_BASE_URL` in `frontend/js/api.js` to match your backend URL

## Current Status

✅ **Frontend**: Ready to view
- Login page created
- Design system implemented
- API client configured

⏳ **Backend**: Not yet implemented
- Choose your backend technology
- Then we'll build the API endpoints

## Next Steps

1. Run the server using one of the options above
2. View the login page at http://localhost:3000/pages/login.html
3. When ready, tell me which backend technology you want to use:
   - "Use Node.js/Express for backend"
   - "Use Python/FastAPI for backend"
   - "Use ASP.NET Core for backend"

