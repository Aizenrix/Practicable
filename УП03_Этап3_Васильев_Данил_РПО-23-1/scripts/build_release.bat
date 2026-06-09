@echo off
chcp 65001 > nul
cd /d "%~dp0\.."

echo ========================================
echo  Calipso.Coffee — сборка release-архива
echo ========================================

if not exist release mkdir release
powershell -NoProfile -Command ^
  "$exclude=@('node_modules','.git','.venv-docs','prisma/dev.db','release/project_release.zip','УП03_*');" ^
  "Get-ChildItem -Path . -Exclude $exclude | Compress-Archive -DestinationPath release/project_release.zip -Force"

echo Готово: release\project_release.zip
