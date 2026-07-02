@echo off
echo === Step 1: Cleaning up Haiku-generated markdown files ===
cd /d "%~dp0"
del /f AUDIT_COMPLETE_SUMMARY.md 2>nul
del /f GIT_PUSH_INSTRUCTIONS.md 2>nul
del /f IMPLEMENTATION_COMPLETE.md 2>nul
del /f IMPLEMENTATION_PLAN_9_10.md 2>nul
del /f PHASE_1_COMMIT_GUIDE.md 2>nul
del /f PHASE_1_QUICK_COMMANDS.md 2>nul
del /f PHASE_BY_PHASE_GUIDE.md 2>nul
del /f PROJECT_OVERVIEW.md 2>nul
del /f QUICK_REFERENCE.md 2>nul
del /f QUICK_START.md 2>nul
del /f README_IMPLEMENTATION.md 2>nul
del /f READY_TO_COMMIT.md 2>nul
del /f REMEDIATION_ACTION_PLAN.md 2>nul
del /f SDLC_MATURITY_SCORECARD.md 2>nul
del /f SECURITY_AUDIT_REPORT.md 2>nul
del /f SECURITY_AUDIT_SUMMARY.md 2>nul
del /f SETUP_GUIDE.md 2>nul
del /f START.md 2>nul
del /f START_HERE.md 2>nul
del /f SYSTEM_HEALTH_DASHBOARD.md 2>nul
del /f TESTING_GUIDE.md 2>nul
del /f cleanup-haiku-files.bat 2>nul
del /f app.yaml.reference 2>nul
del /f navbar-update.patch.ts 2>nul
echo Cleaned up junk files.

echo.
echo === Step 2: Staging and pushing all changes ===
git add -A
git commit -m "feat: Add basePath /lms for subdirectory hosting, cleanup Haiku boilerplate"
git push origin main
echo.
echo === Done. Check GitHub for the push. ===
pause
