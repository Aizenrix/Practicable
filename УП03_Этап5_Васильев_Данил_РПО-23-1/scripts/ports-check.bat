@echo off
chcp 65001 >nul
cd /d "%~dp0\.."
if not exist reports mkdir reports

echo === Docker containers === > reports\security_ports.txt
docker compose ps >> reports\security_ports.txt 2>&1
docker compose -f docker-compose.prod.yml ps >> reports\security_ports.txt 2>&1

echo === Windows LISTENING ports === >> reports\security_ports.txt
netstat -ano | findstr LISTENING >> reports\security_ports.txt

type reports\security_ports.txt
