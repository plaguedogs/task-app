@echo off
title Task App (Standalone)
cd /d "%~dp0"

if not exist ".next\standalone\server.js" (
    echo ERROR: Standalone build not found!
    echo Run BUILD-AND-RUN.bat first.
    pause
    exit /b 1
)

echo Starting Task App (Standalone Server)...
echo.

cd .next\standalone

:: Copy public folder if not exists
if not exist "public" (
    echo Copying public assets...
    xcopy /E /I /Y ..\..\public public >nul
)

:: Copy static files if not exists  
if not exist ".next\static" (
    echo Copying static files...
    xcopy /E /I /Y ..\..\next\static .next\static >nul
)

:: Find available port
set PORT=3000
netstat -an | findstr :3000 | findstr LISTENING >nul 2>&1
if %errorlevel% == 0 set PORT=3001

echo.
echo Server starting on http://localhost:%PORT%
echo Press Ctrl+C to stop
echo.

:: Open browser
start http://localhost:%PORT%

:: Run standalone server (much faster than npm start)
node server.js