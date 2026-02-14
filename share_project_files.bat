@echo off
echo ===================================================
echo   COMPRESSING PROJECT FOR YOUR FRIEND
echo ===================================================
echo.
echo This will create a 'PEGASUS_FULL_ACCESS_FOR_FRIEND.zip' on your Desktop.
echo It contains EVERYTHING except the heavy system files (node_modules).
echo.
echo Your friend just needs to unzip it and run 'npm install'.
echo.
echo Compressing... (This might take a few seconds)
echo.

powershell -Command "Compress-Archive -Path 'src', 'public', 'package.json', 'package-lock.json', 'tsconfig.json', 'next.config.ts', 'tailwind.config.ts', 'postcss.config.mjs', '.env', '.gitignore', 'README.md', 'eslint.config.mjs', 'next-env.d.ts' -DestinationPath '..\PEGASUS_FULL_ACCESS_FOR_FRIEND.zip' -Force"

echo.
echo ===================================================
echo   DONE! 
echo   File created: Desktop\PEGASUS_FULL_ACCESS_FOR_FRIEND.zip
echo ===================================================
pause
