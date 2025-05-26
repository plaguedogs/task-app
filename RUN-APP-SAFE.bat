@echo off
echo Starting Task App...
echo.
echo Current directory:
cd
echo.
echo Changing to app directory...
cd /d "%~dp0"
echo.
echo New directory:
cd
echo.
echo Running npm start...
echo.
cmd /k npm start