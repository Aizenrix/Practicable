#!/bin/sh
cd "$(dirname "$0")/.."
REPORT="reports/security_logs.txt"
mkdir -p reports

{
  echo "=== Security logs check — $(date '+%Y-%m-%d %H:%M:%S') ==="
  echo ""
  if docker compose -f docker-compose.prod.yml ps --status running 2>/dev/null | grep -q calipso; then
    echo "=== docker compose -f docker-compose.prod.yml logs --tail=80 ==="
    docker compose -f docker-compose.prod.yml logs --tail=80 2>&1
  elif docker compose ps --status running 2>/dev/null | grep -q calipso; then
    echo "=== docker compose logs --tail=80 ==="
    docker compose logs --tail=80 2>&1
  else
    echo "Контейнер не запущен. Проверьте reports/logs_tail.txt из этапа 4."
    [ -f reports/logs_tail.txt ] && tail -80 reports/logs_tail.txt
  fi
  echo ""
  echo "Критерий: нет повторяющихся fatal/traceback/EADDRINUSE"
} | tee "$REPORT"

echo "Отчёт: $REPORT"
