#!/bin/sh
set -e

mkdir -p /data

echo "Подготовка базы данных..."
npx prisma db push
node prisma/seed.js

echo "Запуск Calipso.Coffee API на порту ${PORT:-4000}..."
exec node src/server.js
