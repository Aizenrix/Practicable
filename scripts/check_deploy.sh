#!/bin/sh
cd "$(dirname "$0")/.."

echo "========================================"
echo " Calipso.Coffee — проверка развертывания"
echo "========================================"

echo "--- Статус контейнеров ---"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "--- Последние логи ---"
docker compose -f docker-compose.prod.yml logs --tail=40

echo ""
echo "--- Health check ---"
curl -s http://localhost:4000/health || echo "Health check failed"
echo ""
