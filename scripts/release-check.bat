@echo off
chcp 65001 >nul
cd /d "%~dp0\.."
echo Финальная проверка перед релизом
make release-check
exit /b %errorlevel%
