# TEST_PLAN.md — Calipso.Coffee (УП.03 Этап 4)

## 1. Что проверяется

| Параметр | Значение |
|----------|----------|
| Проект | Calipso.Coffee |
| Версия | 1.0.0 |
| Ветка | main |
| Адрес | http://localhost:4000 (docker-compose.prod.yml) |
| Студент | Васильев Данил Вячеславович, РПО 23/1 |

## 2. Основные сценарии

| ID | Сценарий | Ожидаемый результат | Инструмент | Статус |
|----|----------|---------------------|------------|--------|
| TC-01 | Открыть главную страницу | UI загружается без критических ошибок | Browser/DevTools | passed |
| TC-02 | Вход admin@calipso.coffee | JWT-токен получен, панель открыта | UI + API | passed |
| TC-03 | GET /api/menu/items | 200, массив позиций меню | curl/Postman | passed |
| TC-04 | GET /api/reports/summary | 200, метрики сводки | curl/Postman | passed |
| TC-05 | Неверный пароль | 401, понятное сообщение | curl/Postman | passed |
| TC-06 | Запрос без токена | 401 на защищённых маршрутах | node:test API | passed |
| TC-07 | Несуществующий API-маршрут | 404 JSON, не HTML | curl/node:test | passed |
| TC-08 | npm test + API tests | Все тесты pass | npm test | passed |
| TC-09 | Логи после deploy | Нет критических Traceback/500 | docker logs | passed |
| TC-10 | Перезапуск prod-стенда | Сервис снова доступен | make deploy-restart | passed |
| TC-11 | Performance /health | Ответ < 500 ms | curl/k6 | passed |
| TC-12 | Lighthouse web UI | Метрики зафиксированы | Lighthouse/DevTools | manual |

## 3. Инструменты

- Chrome DevTools: Console, Network, Performance
- Lighthouse (npx lighthouse)
- Postman / curl / `scripts/run_api_tests.js`
- node:test (`npm test`)
- k6 (`test/load/basic_load.js`)
- Docker logs (`reports/logs_tail.txt`)

## 4. Итог

| Показатель | Значение |
|------------|----------|
| Критичные ошибки | 0 (после исправления BUG-02) |
| Некритичные | 2 (npm audit, Prisma deprecation warn) |
| Вывод | Проект готов к дальнейшей эксплуатации с учётом рисков из RISK_REGISTER.md |
