@echo off
title Task App - Build and Run
color 0A
cls

echo  ████████╗ █████╗ ███████╗██╗  ██╗     █████╗ ██████╗ ██████╗ 
echo  ╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝    ██╔══██╗██╔══██╗██╔══██╗
echo     ██║   ███████║███████╗█████╔╝     ███████║██████╔╝██████╔╝
echo     ██║   ██╔══██║╚════██║██╔═██╗     ██╔══██║██╔═══╝ ██╔═══╝ 
echo     ██║   ██║  ██║███████║██║  ██╗    ██║  ██║██║     ██║     
echo     ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝     ╚═╝     
echo.

cd /d "%~dp0"

echo Step 1: Building the app...
echo ========================================
npm run build

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo.
echo Step 2: Starting the server...
echo ========================================
echo.
echo Opening http://localhost:3000 in your browser...
echo.

:: Open browser
start http://localhost:3000

echo Press Ctrl+C to stop the server
echo.

:: Start the server
npm start