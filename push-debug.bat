@echo off
cd /d "%~dp0"
del /f ".git\index.lock" 2>nul
git add -A
git commit -m "fix: add error logging, DB health check, and Prisma connection test"
git push origin main
echo.
echo === Pushed. Wait 2-3 min for DO redeploy, then check: ===
echo    https://kantaka-sodhana.app/lms-api/api/health
echo.
pause
