@echo off
chcp 65001 > nul
cd /d "%~dp0\.."

echo ========================================
echo  Calipso.Coffee — проверка качества
echo ========================================

call npm run check
exit /b %errorlevel%
