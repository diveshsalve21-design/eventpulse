@echo off
echo Starting EventPulse Backend and Frontend...
echo.
start "EventPulse Backend (FastAPI)" cmd /k "cd /d %~dp0backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
start "EventPulse Frontend (Web Server)" cmd /k "cd /d %~dp0frontend && npm run dev"
echo.
echo Backend running on:  http://127.0.0.1:8000
echo Frontend running on: http://localhost:8080
echo.
echo Opening EventPulse application in browser...
timeout /t 3 >nul
start http://localhost:8080
