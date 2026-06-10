#!/bin/sh
set -e
cd "$(dirname "$0")/.."
REPORT="reports/security_restore.txt"

BACKUP_FILE="${1:-}"
if [ -z "$BACKUP_FILE" ] && [ -f backups/LATEST.txt ]; then
  BACKUP_FILE=$(tail -1 backups/LATEST.txt)
fi

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
  echo "Укажите файл backup: ./scripts/restore.sh backups/backup_YYYYMMDD_HHMMSS.db"
  exit 1
fi

if docker compose -f docker-compose.prod.yml ps --status running 2>/dev/null | grep -q calipso-coffee-prod; then
  echo "Восстановление в Docker volume (контейнер должен быть остановлен для безопасности)..."
  docker compose -f docker-compose.prod.yml stop app
  docker compose -f docker-compose.prod.yml run --rm -T app sh -c "cat > /data/dev.db" < "$BACKUP_FILE"
  docker compose -f docker-compose.prod.yml start app
elif [ -d prisma ]; then
  cp "$BACKUP_FILE" prisma/dev.db
else
  echo "Не найдена папка prisma/"
  exit 1
fi

{
  echo "=== Restore — $(date '+%Y-%m-%d %H:%M:%S') ==="
  echo "Источник: $BACKUP_FILE"
  echo "Проверка: curl http://localhost:4000/health"
  sleep 2
  curl -s http://localhost:4000/health || echo "(сервер не запущен — запустите make run или make deploy)"
} | tee "$REPORT"

echo "Восстановление завершено. Проверьте данные в приложении."
