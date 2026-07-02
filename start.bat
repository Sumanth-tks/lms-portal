@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo LMS Portal - Starting Server & Client
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    exit /b 1
)

REM Check if .env files exist
if not exist "server\.env" (
    echo ERROR: server\.env not found!
    echo Please run setup.bat first
    pause
    exit /b 1
)

if not exist "client\.env.local" (
    echo ERROR: client\.env.local not found!
    echo Please run setup.bat first
    pause
    exit /b 1
)

echo Starting server on port 5001...
echo Starting client on port 3000...
echo.
echo ========================================
echo Servers will open below. Leave them running.
echo Close both terminal windows to stop.
echo ========================================
echo.

REM Start server in a new window
start "LMS Server (http://localhost:5001)" cmd /k "cd server && npm run dev"

REM Wait a moment for server to start
timeout /t 3 /nobreak

REM Start client in a new window
start "LMS Client (http://localhost:3000)" cmd /k "cd client && npm run dev"

echo.
echo ✓ Both processes started in separate windows
echo.
echo Open your browser to: http://localhost:3000
echo.
pause
