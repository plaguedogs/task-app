@echo off
echo Starting Task App...
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Make sure you're running this from the task-app-settings folder.
    echo Current directory: %cd%
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: Failed to install dependencies!
        echo.
        pause
        exit /b 1
    )
    echo.
)

:: Check if .env.local exists
if not exist ".env.local" (
    echo WARNING: .env.local not found!
    echo Your Google Sheets integration won't work without it.
    echo.
    pause
)

echo Starting server...
echo App will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ----------------------------------------
echo.

:: Start the development server
npm run dev

:: If we get here, the server stopped or crashed
echo.
echo Server stopped or encountered an error.
echo.
pause