@echo off
echo ========================================
echo Starting Dora Dori AI - Full Stack
echo ========================================
echo.
cd /d "%~dp0"
start "Backend Server (Port 4000)" cmd /k "node server/index.js"
timeout /t 3 /nobreak >nul
start "Frontend (Port 8080)" cmd /k "npm run dev"
echo.
echo Both servers starting in separate windows...
echo.
echo Backend: http://localhost:4000
echo Frontend: http://localhost:8080
echo.
pause

