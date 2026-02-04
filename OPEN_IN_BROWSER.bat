@echo off
echo Opening JoinWork in your default browser...
echo.

cd /d "%~dp0"
start "" "%cd%\frontend\index.html"

echo.
echo The page should open in your browser now!
echo.
echo If it doesn't work, manually navigate to:
echo %cd%\frontend\index.html
echo.
pause

