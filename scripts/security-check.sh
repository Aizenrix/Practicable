#!/bin/sh
cd "$(dirname "$0")/.."
REPORT="reports/security_secret_scan.txt"
mkdir -p reports backups

{
  echo "=== Secret scan — $(date '+%Y-%m-%d %H:%M:%S') ==="
  echo ""
  echo "=== git status (секреты не должны быть в индексе) ==="
  git status --short
  echo ""
  echo "=== Поиск подозрительных слов (исключены docs, screenshots, УП03) ==="
  git grep -n -i -E "password|secret|token|api_key|apikey|jwt|smtp|database_url" -- . \
    ":!docs" ":!screenshots" ":!УП03_*" ":!reports" ":!*.png" ":!*.docx" 2>/dev/null || true
  echo ""
  echo "=== Проверка: .env не в Git ==="
  if git ls-files --error-unmatch .env >/dev/null 2>&1; then
    echo "ОШИБКА: .env отслеживается Git!"
  else
    echo "OK: .env не в репозитории"
  fi
  if git ls-files --error-unmatch .env.production >/dev/null 2>&1; then
    echo "ОШИБКА: .env.production отслеживается Git!"
  else
    echo "OK: .env.production не в репозитории"
  fi
  echo ""
  echo "Если найдены реальные пароли/токены — удалить и использовать .env.example"
} | tee "$REPORT"

echo "Отчёт: $REPORT"
