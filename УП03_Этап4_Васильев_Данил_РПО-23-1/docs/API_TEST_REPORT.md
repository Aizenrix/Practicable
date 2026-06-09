# API_TEST_REPORT.md — Calipso.Coffee

**Дата:** 10.06.2026  
**Base URL:** http://localhost:4000  
**Инструменты:** curl, node:test, Postman collection, `scripts/run_api_tests.js`

## Успешные запросы

| Метод | URL | Код | Результат |
|-------|-----|-----|-----------|
| GET | /health | 200 | `{"status":"ok","service":"calipso-coffee-api"}` |
| POST | /api/auth/login | 200 | token + user |
| GET | /api/menu/items | 200 | массив позиций (с Bearer) |
| GET | /api/reports/summary | 200 | ordersCount, revenue (с Bearer) |

## Ошибочные сценарии (корректная обработка)

| Метод | URL | Код | Ожидание |
|-------|-----|-----|----------|
| POST | /api/auth/login (wrong pass) | 401 | `{"error":"Неверный email или пароль"}` |
| GET | /api/auth/me (no token) | 401 | `{"error":"Необходима авторизация"}` |
| GET | /api/unknown-route | 404 | `{"error":"Маршрут API не найден"}` |

## Команды проверки

```bash
make api-test
# или
curl http://localhost:4000/health
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@calipso.coffee","password":"admin123"}'
curl http://localhost:4000/api/unknown-route
```

## Postman

Коллекция: `reports/postman_collection.json`

## Автотесты

```bash
npm test
```

Файлы: `test/api/*.test.js`, `test/smoke/*.test.js`  
Отчёт: `reports/npm_test_report.txt`, `reports/api_test_report.txt`
