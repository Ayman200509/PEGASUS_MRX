@echo off
echo ===================================================
echo   PUSHING FIX TO GITHUB / VERCEL
echo ===================================================
echo.
echo 1. Checking Status...
git status
echo.
echo 2. Adding Files...
git add .
echo.
echo 3. Committing Fix...
git commit -m "Fix typescript build error in finance page"
echo.
echo 4. Pushing to GitHub...
git push
echo.
echo ===================================================
echo   DONE! Check Vercel Dashboard now.
echo ===================================================
pause
