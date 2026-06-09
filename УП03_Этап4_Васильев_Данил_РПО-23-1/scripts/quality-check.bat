@echo off
chcp 65001 > nul
cd /d "%~dp0\.."

echo ========================================
echo  Общая проверка качества проекта
echo ========================================

call scripts\test.bat
if errorlevel 1 exit /b 1
call scripts\api-test.bat
if errorlevel 1 exit /b 1
call scripts\logs-check.bat

echo Проверка завершена. Сохраните скриншот результата.
