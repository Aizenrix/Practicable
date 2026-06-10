@echo off
chcp 65001 >nul
cd /d "%~dp0\.."
echo Сборка проекта Calipso.Coffee
call npm run build
exit /b %errorlevel%
