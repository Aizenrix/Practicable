@echo off
chcp 65001 >nul
cd /d "%~dp0\.."
if not exist backups mkdir backups

for /f "tokens=1-4 delims=/.: " %%a in ("%date% %time%") do set TS=%%c%%b%%a_%%d
set TS=%TS: =0%
set BACKUP=backups\backup_%TS%.db

if exist prisma\dev.db (
  copy /Y prisma\dev.db "%BACKUP%"
  echo Backup создан: %BACKUP% > reports\security_backup.txt
  echo %BACKUP% > backups\LATEST.txt
  echo Backup: %BACKUP%
) else (
  echo БД prisma\dev.db не найдена. Запустите make run или docker compose up.
  exit /b 1
)
