@echo off
cd /d "%~dp0"
del /f ".git\index.lock" 2>nul
git add -A
git commit -m "fix: shared Prisma client, hackathon orderBy, capstone security, error logging"
git push origin main
echo.
echo === Pushed. Wait 2-3 min for DO redeploy, then check: ===
echo    https://kantaka-sodhana.app/lms-api/api/health
echo.
pause
