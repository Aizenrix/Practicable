@echo off
chcp 65001 > nul
cd /d "%~dp0\.."

echo ========================================
echo  Calipso.Coffee — запуск тестов
echo ========================================

make check
exit /b %errorlevel%
