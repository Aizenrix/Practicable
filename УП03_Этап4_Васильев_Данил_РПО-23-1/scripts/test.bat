@echo off
chcp 65001 > nul
cd /d "%~dp0\.."

echo ========================================
echo  Calipso.Coffee — запуск тестов
echo ========================================

call npm test > reports\npm_test_report.txt 2>&1
type reports\npm_test_report.txt
exit /b %errorlevel%
