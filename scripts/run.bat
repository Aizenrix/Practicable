@echo off
chcp 65001 > nul
cd /d "%~dp0\.."

echo ========================================
echo  Calipso.Coffee — локальный запуск
echo ========================================

if not exist .env (
  echo Файл .env не найден. Запустите scripts\setup.bat
  exit /b 1
)

call npm run prisma:push
if errorlevel 1 exit /b 1

call npm run prisma:seed
if errorlevel 1 exit /b 1

call npm run dev
