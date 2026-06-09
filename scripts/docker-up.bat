@echo off
chcp 65001 > nul
cd /d "%~dp0\.."

echo ========================================
echo  Calipso.Coffee — Docker Compose UP
echo ========================================

docker compose up --build
