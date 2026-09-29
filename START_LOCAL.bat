@echo off
setlocal
cd /d "%~dp0\11_PRODUCTION\web"
where node >nul 2>nul || (
  echo [ERROR] Node.js 20+ is required.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 goto :fail
)
call npm run dev
exit /b %errorlevel%
:fail
echo.
echo Dependency installation failed. Check internet access and npm, then run this file again.
pause
exit /b 1
