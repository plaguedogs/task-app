@echo off
title Task App
color 0A

cd /d "%~dp0"

:: Quick check if already built
if exist ".next\BUILD_ID" (
    goto :start_server
)

:: First time setup
cls
echo  ████████╗ █████╗ ███████╗██╗  ██╗     █████╗ ██████╗ ██████╗ 
echo  ╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝    ██╔══██╗██╔══██╗██╔══██╗
echo     ██║   ███████║███████╗█████╔╝     ███████║██████╔╝██████╔╝
echo     ██║   ██╔══██║╚════██║██╔═██╗     ██╔══██║██╔═══╝ ██╔═══╝ 
echo     ██║   ██║  ██║███████║██║  ██╗    ██║  ██║██║     ██║     
echo     ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝     ╚═╝     
echo.
echo First time setup - Building app...
echo This may take a few minutes...
echo.

npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

:start_server
cls
echo Task App is starting...
echo.

:: Find available port
set PORT=3000
netstat -an | findstr :3000 | findstr LISTENING >nul 2>&1
if %errorlevel% == 0 set PORT=3001

:: Open browser after 1 second
start /min cmd /c "timeout /t 1 >nul && start http://localhost:%PORT%"

:: Start server
set PORT=%PORT%
npm start