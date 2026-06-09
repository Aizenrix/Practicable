@echo off
chcp 65001 > nul
cd /d "%~dp0\.."

echo ========================================
echo  Calipso.Coffee — развертывание demo/prod
echo ========================================

if not exist .env.production (
  copy .env.production.example .env.production
  echo Создан .env.production из примера
)

docker compose -f docker-compose.prod.yml up --build -d
if errorlevel 1 exit /b 1

docker compose -f docker-compose.prod.yml ps
echo.
echo Готово: http://localhost:4000
exit /b 0
