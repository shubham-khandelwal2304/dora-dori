@echo off
echo ========================================
echo Starting Dora Dori Backend Server
echo ========================================
echo.
cd /d "%~dp0"
echo Working directory: %CD%
echo.
echo Starting server on port 4000...
echo.
node server/index.js
echo.
echo Server stopped. Press any key to close...
pause

