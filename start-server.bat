@echo off
cd /d "%~dp0"
echo Starting backend server on port 4000...
node server/index.js
pause

