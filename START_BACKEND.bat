@echo off
echo ========================================
echo   Starting JoinWork Backend
echo ========================================
echo.

cd /d "%~dp0"

REM Check if node_modules exists
if not exist "backend\node_modules" (
    echo Installing dependencies...
    cd backend
    call npm install
    cd ..
    echo.
)

echo Starting backend server...
echo.
cd backend
node server.js

pause

