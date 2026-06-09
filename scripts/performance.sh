#!/bin/sh
cd "$(dirname "$0")/.."
BASE="${API_BASE_URL:-http://localhost:4000}"
mkdir -p reports
{
  echo "Calipso.Coffee performance report"
  echo "Base: $BASE"
  curl -s -o /dev/null -w "health: %{http_code} time=%{time_total}s\n" "$BASE/health"
  curl -s -o /dev/null -w "login: %{http_code} time=%{time_total}s\n" -X POST "$BASE/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@calipso.coffee","password":"admin123"}'
  echo ""
  echo "Lighthouse: npx lighthouse $BASE --output html --output-path reports/lighthouse_report.html"
  echo "k6: k6 run test/load/basic_load.js"
} | tee reports/performance_report.txt
