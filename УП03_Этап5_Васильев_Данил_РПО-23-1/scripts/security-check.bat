@echo off
chcp 65001 >nul
cd /d "%~dp0\.."
if not exist reports mkdir reports
if not exist backups mkdir backups

echo === Проверка подозрительных слов в проекте === > reports\security_secret_scan.txt
git grep -n -i -E "password|secret|token|api_key|apikey|jwt|smtp|database_url" -- . ":!docs" ":!screenshots" ":!УП03_*" ":!reports" >> reports\security_secret_scan.txt 2>nul

echo === Проверка статуса Git === >> reports\security_secret_scan.txt
git status --short >> reports\security_secret_scan.txt

echo Secret scan сохранён в reports\security_secret_scan.txt
type reports\security_secret_scan.txt
