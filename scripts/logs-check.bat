@echo off
chcp 65001 > nul
cd /d "%~dp0\.."

echo ========================================
echo  Calipso.Coffee — проверка логов
echo ========================================

docker compose -f docker-compose.prod.yml logs --tail=100 > reports\logs_tail.txt 2>&1
if errorlevel 1 (
  echo Docker logs unavailable, saving local note >> reports\logs_tail.txt
)

type reports\logs_tail.txt
