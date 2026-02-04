@echo off
chcp 65001 >nul
echo ========================================
echo   JoinWork - Quick Start
echo ========================================
echo.

cd /d "%~dp0"

echo Trying to start server...
echo.

REM Try Python simple server first
python -m http.server 3000 --directory frontend 2>nul
if %errorlevel% == 0 (
    echo.
    echo Server started successfully!
    echo Open your browser to: http://localhost:3000
    echo Press Ctrl+C to stop the server
    pause
    exit
)

REM If Python failed, try Node.js
node server.js 2>nul
if %errorlevel% == 0 (
    echo.
    echo Server started successfully!
    echo Open your browser to: http://localhost:3000
    echo Press Ctrl+C to stop the server
    pause
    exit
)

REM If both failed, just open the HTML file
echo.
echo Could not start server. Opening HTML file directly...
echo.
start "" "%~dp0frontend\index.html"
echo.
echo The page should open in your browser!
echo Note: Some features may not work without a server.
echo.
pause

