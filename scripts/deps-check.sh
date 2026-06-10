#!/bin/sh
cd "$(dirname "$0")/.."
REPORT="reports/security_deps_audit.txt"
mkdir -p reports

{
  echo "=== Dependency check — $(date '+%Y-%m-%d %H:%M:%S') ==="
  echo ""
  echo "=== npm audit ==="
  npm audit 2>&1 || true
  echo ""
  echo "=== npm outdated (кратко) ==="
  npm outdated 2>&1 || true
  echo ""
  echo "Рекомендация: npm audit fix для moderate, регулярное обновление зависимостей"
} | tee "$REPORT"

echo "Отчёт: $REPORT"
