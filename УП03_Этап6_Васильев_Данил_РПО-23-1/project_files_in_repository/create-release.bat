@echo off
chcp 65001 >nul
cd /d "%~dp0\.."
echo Создание release-архива
make build-release
exit /b %errorlevel%
