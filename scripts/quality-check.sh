#!/bin/sh
cd "$(dirname "$0")/.."
chmod +x scripts/test.sh scripts/api-test.sh scripts/logs-check.sh 2>/dev/null || true
./scripts/test.sh && ./scripts/api-test.sh && ./scripts/logs-check.sh
echo "Quality check completed"
