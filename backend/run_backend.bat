@echo off
echo Starting ResQMeal Backend Server...
cd /d "%~dp0"
..\venv\Scripts\uvicorn.exe app.main:app --reload --host 0.0.0.0 --port 8000
