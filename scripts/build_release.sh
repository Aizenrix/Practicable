#!/bin/sh
set -e
cd "$(dirname "$0")/.."

echo "========================================"
echo " Calipso.Coffee — сборка release-архива"
echo "========================================"

mkdir -p release
OUT="release/project_release.zip"
rm -f "$OUT"

zip -r "$OUT" . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x ".venv-docs/*" \
  -x "prisma/dev.db" \
  -x "prisma/dev.db-journal" \
  -x "release/project_release.zip" \
  -x "УП03_*/*" \
  -x ".DS_Store"

echo "Готово: $OUT"
