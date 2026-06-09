@echo off
chcp 65001 > nul
cd /d "%~dp0\.."

echo ========================================
echo  Calipso.Coffee — Docker Compose DOWN
echo ========================================

docker compose down
