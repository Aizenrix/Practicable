#!/bin/sh
cd "$(dirname "$0")/.."
mkdir -p reports
echo "Calipso.Coffee — запуск тестов"
npm test 2>&1 | tee reports/npm_test_report.txt
