@echo off
echo Fixing Next.js Dependencies
echo ==========================
echo.

echo Clearing npm cache...
npm cache clean --force
echo.

echo Removing old node_modules...
rmdir /s /q node_modules 2>nul
del /q package-lock.json 2>nul
echo.

echo Installing fresh dependencies...
npm install --legacy-peer-deps
echo.

echo Checking if Next.js is installed...
if exist "node_modules\.bin\next.cmd" (
    echo [OK] Next.js installed successfully!
    echo.
    echo You can now run start.bat
) else (
    echo [ERROR] Next.js still not found!
    echo.
    echo Try installing manually:
    echo   npm install next@latest react@latest react-dom@latest --legacy-peer-deps
)
echo.
pause