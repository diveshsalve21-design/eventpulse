@echo off
echo ===================================================
echo   EventPulse Online Deployment Helper
echo ===================================================
echo.
echo 1. Pushing local Git repository to GitHub...
echo Please ensure you have created a repository at:
echo https://github.com/new (Name: eventpulse)
echo.
set /p REPO_URL="Enter your GitHub Repository URL (or press Enter for default https://github.com/moksha-design/eventpulse.git): "
if "%REPO_URL%"=="" set REPO_URL=https://github.com/moksha-design/eventpulse.git

git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main
git push -u origin main

echo.
echo ===================================================
echo   GitHub Push Complete!
echo ===================================================
echo Next steps:
echo 1. Connect your GitHub repo to Render (https://dashboard.render.com) for backend API hosting.
echo 2. Connect your GitHub repo to Vercel (https://vercel.com/new) for frontend hosting.
echo.
pause
