@echo off
chcp 65001 >nul
cd /d "%~dp0\.."

set BACKUP=%1
if "%BACKUP%"=="" (
  if exist backups\LATEST.txt (
    set /p BACKUP=<backups\LATEST.txt
  )
)

if not exist "%BACKUP%" (
  echo Укажите файл: scripts\restore.bat backups\backup_YYYYMMDD.db
  exit /b 1
)

copy /Y "%BACKUP%" prisma\dev.db
echo Restore из %BACKUP% > reports\security_restore.txt
echo Проверьте http://localhost:4000 после make run
