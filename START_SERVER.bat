@echo off
echo Starting JoinWork Server...
echo.

REM Check for Python
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using Python server...
    python start-server.py
    goto :end
)

REM Check for Node.js
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using Node.js server...
    node server.js
    goto :end
)

echo.
echo ERROR: Neither Python nor Node.js is installed.
echo.
echo Please install one of the following:
echo   1. Python 3.x from https://www.python.org/downloads/
echo   2. Node.js from https://nodejs.org/
echo.
echo Or simply open frontend/index.html in your web browser
echo (Note: API calls will not work without a backend server)
echo.
pause

:end

