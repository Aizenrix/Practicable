#!/bin/sh
cd "$(dirname "$0")/.."
REPORT="reports/security_ports.txt"
mkdir -p reports

{
  echo "=== Open ports check — $(date '+%Y-%m-%d %H:%M:%S') ==="
  echo ""
  echo "=== docker compose ps (dev) ==="
  docker compose ps 2>&1 || echo "(docker недоступен)"
  echo ""
  echo "=== docker compose ps (prod) ==="
  docker compose -f docker-compose.prod.yml ps 2>&1 || echo "(docker недоступен)"
  echo ""
  echo "=== Прослушиваемые порты (macOS/Linux) ==="
  if command -v lsof >/dev/null 2>&1; then
    lsof -nP -iTCP -sTCP:LISTEN 2>/dev/null | grep -E "4000|node|docker" || lsof -nP -iTCP -sTCP:LISTEN 2>/dev/null | head -20
  elif command -v ss >/dev/null 2>&1; then
    ss -tlnp 2>/dev/null | head -20
  else
    netstat -an 2>/dev/null | grep LISTEN | head -20
  fi
  echo ""
  echo "Ожидается: только 4000 для Calipso.Coffee (demo/prod)"
} | tee "$REPORT"

echo "Отчёт: $REPORT"
