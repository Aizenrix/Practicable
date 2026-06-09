#!/bin/sh
cd "$(dirname "$0")/.."
mkdir -p reports
docker compose -f docker-compose.prod.yml logs --tail=100 > reports/logs_tail.txt 2>&1 || \
  echo "Docker prod logs unavailable. Run: make deploy" >> reports/logs_tail.txt
cat reports/logs_tail.txt
