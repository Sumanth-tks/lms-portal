@echo off
cd /d "%~dp0"
git add -A
git commit -m "fix: ignore TS build errors, update API prefix to /lms-api"
git push origin main
echo.
echo === Done. DO will auto-redeploy. Wait 2-3 min then check kantaka-sodhana.app/lms ===
pause
