@echo off
title Task App - Development Mode
color 0B
cls

echo ╔════════════════════════════════════════╗
echo ║      TASK APP - DEVELOPMENT MODE       ║
echo ║                                        ║
echo ║  Auto-refresh enabled for live edits   ║
echo ╚════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo Starting development server...
echo.
echo The app will auto-refresh when you make changes!
echo.
echo Opening http://localhost:3000
echo.

start http://localhost:3000

npm run dev