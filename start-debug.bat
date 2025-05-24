@echo off
echo Task App - Debug Mode
echo =====================
echo.

echo System Information:
echo -------------------
echo Current Directory: %cd%
echo.

echo Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Checking npm...
npm --version
echo.

echo Checking for required files...
echo ------------------------------
if exist "package.json" (
    echo [OK] package.json found
) else (
    echo [ERROR] package.json NOT found!
    echo Make sure you're in the task-app-settings folder
)

if exist ".env.local" (
    echo [OK] .env.local found
) else (
    echo [WARNING] .env.local NOT found - Google Sheets won't work!
)

if exist "node_modules\" (
    echo [OK] node_modules found
) else (
    echo [INFO] node_modules NOT found - will install dependencies
)
echo.

:: Try to install dependencies if needed
if not exist "node_modules\" (
    echo Installing dependencies...
    echo Running: npm install --legacy-peer-deps
    echo.
    npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: npm install failed!
        echo Try running this command manually:
        echo   npm install --legacy-peer-deps
        echo.
        pause
        exit /b 1
    )
)

echo.
echo Starting development server...
echo ==============================
echo.

:: Run dev server with full output
npm run dev

:: If we get here, something went wrong
echo.
echo ==============================
echo Server stopped or crashed!
echo.
echo Common issues:
echo - Port 3000 already in use
echo - Missing dependencies
echo - Syntax errors in code
echo.
echo Try running: npm run dev
echo in a terminal to see the full error
echo.
pause