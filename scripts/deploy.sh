#!/bin/sh
set -e
cd "$(dirname "$0")/.."

echo "========================================"
echo " Calipso.Coffee — развертывание demo/prod"
echo "========================================"

if [ ! -f .env.production ]; then
  cp .env.production.example .env.production
  echo "Создан .env.production из примера"
fi

docker compose -f docker-compose.prod.yml up --build -d
docker compose -f docker-compose.prod.yml ps
echo ""
echo "Готово: http://localhost:4000"
