# Quick Start Guide - JoinWork

## 🚀 Easiest Way to View the Project

### Method 1: Open HTML File Directly (No Server Needed)
1. Navigate to the `frontend` folder
2. Double-click `index.html` to open in your browser
3. Or double-click `pages/login.html` to see the login page

**Note:** API calls won't work, but you can see all the UI and design!

### Method 2: Use Python Server (If Python is installed)
1. Open PowerShell or Command Prompt in this folder
2. Run: `python start-server.py`
3. Open browser to: `http://localhost:3000`

### Method 3: Use Node.js Server (If Node.js is installed)
1. Open PowerShell or Command Prompt in this folder
2. Run: `node server.js`
3. Open browser to: `http://localhost:3000`

### Method 4: Double-click START_SERVER.bat
Just double-click the `START_SERVER.bat` file - it will try to start automatically.

---

## 📁 File Locations

- **Home Page**: `frontend/index.html`
- **Login Page**: `frontend/pages/login.html`
- **All CSS**: `frontend/css/`
- **All JavaScript**: `frontend/js/`

---

## 🔧 Troubleshooting

### If Python/Node.js not found:
- **Option A**: Just open `frontend/index.html` directly in your browser (works without server!)
- **Option B**: Install Python from https://www.python.org/downloads/
- **Option C**: Install Node.js from https://nodejs.org/

### If port 3000 is busy:
- Edit `start-server.py` and change `PORT = 3000` to `PORT = 8000`
- Then use `http://localhost:8000`

### If you see CORS errors:
- This is normal - the backend isn't set up yet
- The frontend UI will still work and look correct

---

## ✅ What Works Right Now

- ✅ Login page design and layout
- ✅ All CSS styling and theme colors
- ✅ Form validation (client-side)
- ✅ Responsive design
- ⏳ API calls (will work after backend is set up)

---

## 🎯 Next Steps

1. **View the pages**: Open `frontend/index.html` or `frontend/pages/login.html` in your browser
2. **Choose backend**: Tell me which backend you want:
   - "Use Node.js/Express"
   - "Use Python/FastAPI"
   - "Use ASP.NET Core"
3. **Build more pages**: Ask me to create any page you need!

