@echo off
title Task App Debug
color 0E
cls

echo DEBUG MODE - Task App Launcher
echo ==============================
echo.

echo Current directory:
cd
echo.

echo Changing to script directory...
cd /d "%~dp0"

echo New directory:
cd
echo.

echo.
echo Checking for Node.js...
where node
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found in PATH!
    echo.
    echo PATH contents:
    echo %PATH%
    echo.
    pause
    exit /b 1
)

echo.
echo Node version:
node --version

echo.
echo NPM version:
npm --version

echo.
echo Checking for package.json...
if exist "package.json" (
    echo package.json found!
) else (
    echo [ERROR] package.json not found!
    echo.
    echo Directory contents:
    dir /b
    echo.
    pause
    exit /b 1
)

echo.
echo Checking for node_modules...
if exist "node_modules" (
    echo node_modules found!
) else (
    echo node_modules not found - will need to install
)

echo.
echo Checking for .next build folder...
if exist ".next" (
    echo .next folder found!
) else (
    echo .next folder not found - will need to build
)

echo.
echo Press any key to continue with startup...
pause >nul

echo.
echo Starting app with npm start...
npm start

echo.
echo [Process ended]
pause