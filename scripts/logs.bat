@echo off
chcp 65001 > nul
cd /d "%~dp0\.."

echo ========================================
echo  Calipso.Coffee — логи контейнеров
echo ========================================

docker compose logs -f
