#!/bin/sh
# Демонстрация проверки ролей и доступа к чужим данным (этап 5, скриншоты 05–06)
cd "$(dirname "$0")/.."
BASE="${BASE_URL:-http://localhost:4000}"
REPORT="reports/security_access_check.txt"
mkdir -p reports

{
  echo "=== Role & access check — $(date '+%Y-%m-%d %H:%M:%S') ==="
  echo "BASE_URL=$BASE"
  echo ""

  echo "--- ADMIN login ---"
  ADMIN_JSON=$(curl -s -X POST "$BASE/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@calipso.coffee","password":"admin123"}')
  echo "$ADMIN_JSON"
  ADMIN_TOKEN=$(echo "$ADMIN_JSON" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).token||'')}catch{}})")

  echo ""
  sleep 4
  echo "--- WAITER login ---"
  WAITER_JSON=$(curl -s -X POST "$BASE/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"waiter@calipso.coffee","password":"waiter123"}')
  echo "$WAITER_JSON"
  WAITER_TOKEN=$(echo "$WAITER_JSON" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).token||'')}catch{}})")

  echo ""
  echo "--- ADMIN GET /api/users (ожидается 200) ---"
  curl -s -w "\nHTTP %{http_code}\n" "$BASE/api/users" -H "Authorization: Bearer $ADMIN_TOKEN"

  echo ""
  echo "--- WAITER GET /api/users (ожидается 403) ---"
  curl -s -w "\nHTTP %{http_code}\n" "$BASE/api/users" -H "Authorization: Bearer $WAITER_TOKEN"

  echo ""
  echo "--- Создание заказа от ADMIN для теста чужих данных ---"
  ORDER_JSON=$(curl -s -X POST "$BASE/api/orders" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"tableId":1,"items":[{"menuItemId":1,"quantity":1}]}')
  echo "$ORDER_JSON"
  ORDER_ID=$(echo "$ORDER_JSON" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).id||'')}catch{}})")

  if [ -n "$ORDER_ID" ] && [ -n "$WAITER_TOKEN" ]; then
    echo ""
    echo "--- WAITER GET /api/orders/$ORDER_ID (чужой заказ, ожидается 403) ---"
    curl -s -w "\nHTTP %{http_code}\n" "$BASE/api/orders/$ORDER_ID" -H "Authorization: Bearer $WAITER_TOKEN"
  fi
} | tee "$REPORT"

echo "Отчёт: $REPORT"
