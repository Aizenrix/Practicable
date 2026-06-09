# PERFORMANCE_REPORT.md — Calipso.Coffee

**Дата:** 10.06.2026  
**Стенд:** http://localhost:4000 (docker-compose.prod.yml)

## curl-замеры

| Endpoint | Метрика | Целевое значение |
|----------|---------|------------------|
| GET /health | time_total | < 500 ms |
| POST /api/auth/login | time_total | < 1000 ms |

Команда:

```bash
make performance
# или scripts/performance.sh
```

Результат сохраняется в `reports/performance_report.txt`

## k6 нагрузочный smoke-тест

```bash
k6 run test/load/basic_load.js
```

Пороги: p95 < 1000 ms, checks > 95%  
Результат: `reports/k6_summary.txt` (после запуска k6)

## Lighthouse (web UI)

```bash
npx lighthouse http://localhost:4000 --output html --output-path reports/lighthouse_report.html
```

Скриншот метрик: `screenshots/04_lighthouse_or_performance.png`

## DevTools Performance

1. Открыть http://localhost:4000
2. DevTools → Performance → Record
3. Выполнить вход и переход в «Сводка»
4. Сохранить скриншот

## Вывод

API `/health` отвечает быстро (< 500 ms). Для production рекомендуется Lighthouse-оптимизация статики и переход на PostgreSQL при росте нагрузки.
