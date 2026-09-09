@echo off
echo ========================================================
echo Starting ResQMeal Full-Stack Platform...
echo ========================================================
cd /d "%~dp0"

echo [1/2] Launching FastAPI Backend on http://localhost:8000 ...
start "ResQMeal Backend" powershell -NoExit -Command "cd backend; ..\venv\Scripts\activate; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo [2/2] Launching Next.js Frontend on http://localhost:3000 ...
start "ResQMeal Frontend" powershell -NoExit -Command "cd frontend; npm run dev"

echo ========================================================
echo Both servers are launching!
echo Backend Docs:  http://localhost:8000/docs
echo Frontend App:  http://localhost:3000
echo ========================================================
