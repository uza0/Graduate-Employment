@echo off
echo ========================================
echo   Starting JoinWork Backend
echo   (Python Flask Version)
echo ========================================
echo.

cd /d "%~dp0\backend"

echo Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed!
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

echo.
echo Installing/updating dependencies...
pip install -q -r requirements.txt

echo.
echo Starting backend server...
echo.
python app.py

pause

