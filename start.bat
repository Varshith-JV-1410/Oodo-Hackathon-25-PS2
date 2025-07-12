@echo off
echo Starting StackIt Q&A Platform...
echo.

echo Starting Backend Server...
start cmd /k "cd /d %~dp0 && node server/server.js"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start cmd /k "cd /d %~dp0client && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
