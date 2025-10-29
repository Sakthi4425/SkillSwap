@echo off
echo Starting SkillSwap Application...
echo.

echo Starting Django Backend Server...
start cmd /k "venv\Scripts\activate && python manage.py runserver"

echo Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo Starting React Frontend...
start cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting!
echo Django: http://localhost:8000
echo React: http://localhost:3000
echo.
echo Close the command windows to stop the servers.
pause

