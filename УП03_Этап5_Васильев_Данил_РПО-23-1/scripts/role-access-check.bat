@echo off
chcp 65001 >nul
cd /d "%~dp0\.."
set BASE_URL=http://localhost:4000
if not exist reports mkdir reports

echo === Role access check === > reports\security_access_check.txt
echo Запустите на Mac/Linux: make role-access-check >> reports\security_access_check.txt
echo Или вручную curl login admin и waiter, GET /api/users, GET /api/orders/:id >> reports\security_access_check.txt

type reports\security_access_check.txt
