@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo LMS Portal - Setup Script (Windows)
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Download from https://nodejs.org (LTS version)
    pause
    exit /b 1
)

echo ✓ Node.js found:
node --version

echo.
echo Step 1: Creating server .env file...
echo.

REM Create server .env file if it doesn't exist
if not exist "server\.env" (
    echo DATABASE_URL="postgresql://replace-with-your-neon-connection-string"> server\.env
    echo JWT_SECRET="your-super-secret-random-key-make-it-long-123456789abcdef">> server\.env
    echo JWT_REFRESH_SECRET="another-different-secret-key-987654321fedcba">> server\.env
    echo PORT=5001>> server\.env
    echo CLIENT_URL="http://localhost:3000">> server\.env
    echo.
    echo ✓ Created server\.env
    echo.
    echo IMPORTANT! Edit server\.env and replace:
    echo   - DATABASE_URL with your PostgreSQL connection string
    echo.
    pause
) else (
    echo ✓ server\.env already exists (skipping)
)

echo.
echo Step 2: Creating client .env.local file...
echo.

REM Create client .env.local file if it doesn't exist
if not exist "client\.env.local" (
    echo NEXT_PUBLIC_API_URL="http://localhost:5001/api"> client\.env.local
    echo ✓ Created client\.env.local
) else (
    echo ✓ client\.env.local already exists (skipping)
)

echo.
echo Step 3: Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install server dependencies
    pause
    exit /b 1
)
cd ..
echo ✓ Server dependencies installed

echo.
echo Step 4: Setting up database...
cd server
echo Running: npx prisma generate
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Prisma generate failed
    pause
    exit /b 1
)

echo Running: npx prisma migrate deploy
call npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo WARNING: Migration may have failed, trying db:push...
    call npx prisma db push
)

echo Running: npm run db:seed
call npm run db:seed
if %errorlevel% neq 0 (
    echo ERROR: Database seed failed
    echo Try running: npm run db:seed
    pause
    exit /b 1
)
cd ..
echo ✓ Database set up complete

echo.
echo Step 5: Installing client dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install client dependencies
    pause
    exit /b 1
)
cd ..
echo ✓ Client dependencies installed

echo.
echo ========================================
echo ✓ Setup Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Open server\.env and update DATABASE_URL with your PostgreSQL connection
echo    (Get one free from https://neon.com)
echo.
echo 2. Start the backend (in this window or a new terminal):
echo    cd server
echo    npm run dev
echo.
echo 3. Start the frontend (in another terminal):
echo    cd client
echo    npm run dev
echo.
echo 4. Open http://localhost:3000 in your browser
echo.
echo 5. Login with:
echo    Email: admin@lms.com
echo    Password: Admin@123
echo.
echo 6. CHANGE THE PASSWORD IMMEDIATELY!
echo.
pause
