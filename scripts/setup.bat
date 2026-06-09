@echo off
chcp 65001 > nul
cd /d "%~dp0\.."

echo ========================================
echo  Calipso.Coffee — установка зависимостей
echo ========================================

call npm install
if errorlevel 1 exit /b 1

call npm run prisma:generate
if errorlevel 1 exit /b 1

if not exist .env (
  copy .env.example .env
  echo Создан файл .env из .env.example
)

echo.
echo Установка завершена успешно.
exit /b 0
