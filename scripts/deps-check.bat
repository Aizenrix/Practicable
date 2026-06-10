@echo off
chcp 65001 >nul
cd /d "%~dp0\.."
if not exist reports mkdir reports

echo === npm audit === > reports\security_deps_audit.txt
call npm audit >> reports\security_deps_audit.txt 2>&1

echo === npm outdated === >> reports\security_deps_audit.txt
call npm outdated >> reports\security_deps_audit.txt 2>&1

echo Dependency check: reports\security_deps_audit.txt
type reports\security_deps_audit.txt
