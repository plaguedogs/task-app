@echo off
echo ========================================
echo Task App - Simple EXE Builder
echo ========================================
echo.

:: Create a simple launcher script
echo Creating launcher...

:: Create launcher.js
(
echo const { exec } = require('child_process'^);
echo const path = require('path'^);
echo const http = require('http'^);
echo.
echo console.log('Starting Task App...'^);
echo console.log('This will open in your default browser.'^);
echo console.log(''^);
echo.
echo // Check if port 3000 is available
echo const server = http.createServer(^);
echo server.once('error', (^) =^> {
echo   console.log('Port 3000 is in use. Please close other applications using this port.'^);
echo   setTimeout((^) =^> process.exit(1^), 3000^);
echo }^);
echo.
echo server.once('listening', (^) =^> {
echo   server.close(^);
echo   // Start the app
echo   const child = exec('npm start', {
echo     cwd: __dirname,
echo     env: { ...process.env, PORT: '3000' }
echo   }^);
echo.  
echo   child.stdout.pipe(process.stdout^);
echo   child.stderr.pipe(process.stderr^);
echo.
echo   // Open browser after 3 seconds
echo   setTimeout((^) =^> {
echo     const start = process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open';
echo     exec(`${start} http://localhost:3000`^);
echo   }, 3000^);
echo.
echo   console.log('Server starting on http://localhost:3000'^);
echo   console.log('Press Ctrl+C to stop'^);
echo }^);
echo.
echo server.listen(3000^);
) > launcher.js

echo.
echo Building production app...
call npm run build

echo.
echo Creating batch launcher...
(
echo @echo off
echo cd /d "%%~dp0"
echo echo Starting Task App...
echo echo.
echo npm start
echo pause
) > TaskApp.bat

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Created: TaskApp.bat
echo.
echo To run the app, double-click TaskApp.bat
echo.
echo To create a desktop shortcut:
echo 1. Right-click TaskApp.bat
echo 2. Select "Create shortcut"
echo 3. Move shortcut to desktop
echo.
pause