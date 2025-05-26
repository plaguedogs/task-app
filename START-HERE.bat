@echo off
cls
echo.
echo  ████████╗ █████╗ ███████╗██╗  ██╗     █████╗ ██████╗ ██████╗ 
echo  ╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝    ██╔══██╗██╔══██╗██╔══██╗
echo     ██║   ███████║███████╗█████╔╝     ███████║██████╔╝██████╔╝
echo     ██║   ██╔══██║╚════██║██╔═██╗     ██╔══██║██╔═══╝ ██╔═══╝ 
echo     ██║   ██║  ██║███████║██║  ██╗    ██║  ██║██║     ██║     
echo     ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝     ╚═╝     
echo.
echo Starting Task App...
echo.

cd /d "%~dp0"

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install --legacy-peer-deps
    echo.
)

:: Run the app
echo Launching app...
node start-app.js

pause