@echo off
chcp 65001 > nul
cd /d "%~dp0\.."

echo ========================================
echo  Calipso.Coffee — проверка производительности
echo ========================================

set BASE=http://localhost:4000

echo Measure /health > reports\performance_report.txt
curl -s -o nul -w "health: %%{http_code} time=%%{time_total}s\n" %BASE%/health >> reports\performance_report.txt

echo Measure /api/auth/login >> reports\performance_report.txt
curl -s -o nul -w "login: %%{http_code} time=%%{time_total}s\n" -X POST %BASE%/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@calipso.coffee\",\"password\":\"admin123\"}" >> reports\performance_report.txt

echo. >> reports\performance_report.txt
echo Для Lighthouse: npx lighthouse %BASE% --output html --output-path reports/lighthouse_report.html >> reports\performance_report.txt
echo Для k6: k6 run test/load/basic_load.js >> reports\performance_report.txt

type reports\performance_report.txt
