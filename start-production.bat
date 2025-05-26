@echo off
echo Starting Task App (Production Build)...
echo.

cd /d "%~dp0"

:: Set default port
set PORT=3000

:: Try to find an available port if 3000 is taken
netstat -an | findstr :3000 | findstr LISTENING >nul
if %errorlevel% == 0 (
    echo Port 3000 is in use, trying 3001...
    set PORT=3001
    netstat -an | findstr :3001 | findstr LISTENING >nul
    if %errorlevel% == 0 (
        echo Port 3001 is in use, trying 3002...
        set PORT=3002
        netstat -an | findstr :3002 | findstr LISTENING >nul
        if %errorlevel% == 0 (
            echo Port 3002 is in use, trying 3003...
            set PORT=3003
        )
    )
)

echo Using port %PORT%
echo.

:: Run production build
set NODE_ENV=production
npm start -- --port %PORT%

pause