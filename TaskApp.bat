@echo off
title Task App
color 0A
cls

echo  ████████╗ █████╗ ███████╗██╗  ██╗     █████╗ ██████╗ ██████╗ 
echo  ╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝    ██╔══██╗██╔══██╗██╔══██╗
echo     ██║   ███████║███████╗█████╔╝     ███████║██████╔╝██████╔╝
echo     ██║   ██╔══██║╚════██║██╔═██╗     ██╔══██║██╔═══╝ ██╔═══╝ 
echo     ██║   ██║  ██║███████║██║  ██╗    ██║  ██║██║     ██║     
echo     ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝     ╚═╝     
echo.
echo Starting Task App Server...
echo.

cd /d "%~dp0"

:: Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo.

:: Check if npm is accessible
echo Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not accessible!
    echo.
    pause
    exit /b 1
)

echo npm found:
npm --version
echo.

:: Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies (first time only)...
    npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
)

:: Check if production build exists
if not exist ".next" (
    echo Building app (first time only)...
    npm run build
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to build app!
        pause
        exit /b 1
    )
    echo.
)

:: Find available port
set PORT=3000
netstat -an | findstr :3000 | findstr LISTENING >nul
if %errorlevel% == 0 (
    set PORT=3001
    netstat -an | findstr :3001 | findstr LISTENING >nul
    if %errorlevel% == 0 (
        set PORT=3002
    )
)

echo.
echo ========================================
echo Server starting on port %PORT%
echo ========================================
echo.
echo Opening http://localhost:%PORT% in your browser...
echo.
echo Press Ctrl+C to stop the server
echo.

:: Open browser after 2 seconds
ping localhost -n 3 >nul
start http://localhost:%PORT%

:: Start the server
set PORT=%PORT%
npm start

:: If we get here, the server stopped
echo.
echo Server stopped.
pause