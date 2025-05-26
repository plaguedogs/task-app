@echo off
echo Building Task App Executable...
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install --legacy-peer-deps
    echo.
)

:: Build Next.js app
echo Building Next.js app...
npm run build

:: Check if build succeeded
if not exist ".next\standalone" (
    echo ERROR: Next.js build failed!
    pause
    exit /b 1
)

:: Copy public folder to standalone
echo Copying public assets...
xcopy /E /I /Y public .next\standalone\public

:: Copy static files
echo Copying static files...
xcopy /E /I /Y .next\static .next\standalone\.next\static

:: Create electron package
echo.
echo Building Electron executable...
npx electron-builder --win

echo.
echo Build complete! Check the dist-electron folder for your .exe file
pause