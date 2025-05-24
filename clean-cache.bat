@echo off
echo Cleaning Next.js cache...
echo.

rmdir /s /q .next 2>nul
echo [OK] Cleared .next folder

echo.
echo Cache cleared! Now you can run start.bat
echo.
pause