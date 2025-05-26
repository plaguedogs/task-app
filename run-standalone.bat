@echo off
echo Starting Task App (Standalone Build)...
echo.

cd /d "%~dp0"

if exist ".next\standalone" (
    echo Running standalone server...
    cd .next\standalone
    node server.js
) else (
    echo Standalone build not found. Building now...
    call npm run build
    echo.
    echo Build complete. Running server...
    cd .next\standalone
    node server.js
)

pause