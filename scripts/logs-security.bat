@echo off
chcp 65001 >nul
cd /d "%~dp0\.."
if not exist reports mkdir reports

echo === Docker logs === > reports\security_logs.txt
docker compose -f docker-compose.prod.yml logs --tail=80 >> reports\security_logs.txt 2>&1
docker compose logs --tail=80 >> reports\security_logs.txt 2>&1

type reports\security_logs.txt
