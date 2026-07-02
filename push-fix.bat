@echo off
cd /d "%~dp0"
git add -A
git commit -m "fix: revert API routes to /api, remove eslint config for Next.js 16"
git push origin main
echo.
echo === Done. DO will auto-redeploy. Wait 2-3 min then check kantaka-sodhana.app/lms ===
pause
