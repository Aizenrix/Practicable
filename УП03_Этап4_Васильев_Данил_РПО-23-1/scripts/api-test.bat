@echo off
chcp 65001 > nul
cd /d "%~dp0\.."

echo ========================================
echo  Calipso.Coffee — проверка API
echo ========================================

node scripts\run_api_tests.js
exit /b %errorlevel%
