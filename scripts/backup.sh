#!/bin/sh
set -e
cd "$(dirname "$0")/.."
mkdir -p backups

TS=$(date '+%Y%m%d_%H%M%S')
BACKUP_FILE="backups/backup_${TS}.db"
REPORT="reports/security_backup.txt"

if docker compose -f docker-compose.prod.yml ps --status running 2>/dev/null | grep -q calipso-coffee-prod; then
  echo "Backup из Docker volume calipso_prod_data..."
  docker compose -f docker-compose.prod.yml exec -T app sh -c "cat /data/dev.db" > "$BACKUP_FILE"
elif [ -f prisma/dev.db ]; then
  echo "Backup локальной SQLite prisma/dev.db..."
  cp prisma/dev.db "$BACKUP_FILE"
else
  echo "БД не найдена. Запустите make run или make deploy."
  exit 1
fi

{
  echo "=== Backup — $(date '+%Y-%m-%d %H:%M:%S') ==="
  echo "Файл: $BACKUP_FILE"
  ls -la "$BACKUP_FILE"
  echo "Размер: $(wc -c < "$BACKUP_FILE") байт"
} | tee "$REPORT"

echo "Последний backup:" > backups/LATEST.txt
echo "$BACKUP_FILE" >> backups/LATEST.txt
echo "Готово: $BACKUP_FILE"
