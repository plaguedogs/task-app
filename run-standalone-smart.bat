@echo off
echo Starting Task App (Standalone Build with Auto Port)...
echo.

cd /d "%~dp0"

:: Function to find available port
set PORT=3000
set MAX_PORT=3010

:findport
netstat -an | findstr :%PORT% | findstr LISTENING >nul
if %errorlevel% == 0 (
    set /a PORT+=1
    if %PORT% LEQ %MAX_PORT% (
        goto findport
    ) else (
        echo All ports 3000-3010 are in use!
        pause
        exit /b 1
    )
)

echo Found available port: %PORT%
echo.

if exist ".next\standalone" (
    echo Running standalone server on port %PORT%...
    echo Open your browser at http://localhost:%PORT%
    echo.
    cd .next\standalone
    set PORT=%PORT%
    node server.js
) else (
    echo Standalone build not found. Please run: npm run build
    echo.
)

pause