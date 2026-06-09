@echo off
chcp 65001 > nul
cd /d "%~dp0\.."

echo ========================================
echo  Calipso.Coffee — форматирование кода
echo ========================================

call npm run format
exit /b %errorlevel%
