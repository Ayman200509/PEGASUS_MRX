@echo off
echo ===================================================
echo   DEPLOYING UPDATES TO VERCEL
echo ===================================================
echo.
echo 1. Adding all changes...
git add .
echo.
echo 2. Committing changes...
set /p commit_msg="Enter commit message (default: 'Update items'): "
if "%commit_msg%"=="" set commit_msg=Update items
git commit -m "%commit_msg%"
echo.
echo 3. Pushing to GitHub (Vercel will auto-deploy)...
git push
echo.
echo ===================================================
echo   DONE! Your site is updating.
echo   Visit your Vercel Dashboard to see progress.
echo ===================================================
pause
