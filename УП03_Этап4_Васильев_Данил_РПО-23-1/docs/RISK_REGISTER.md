# RISK_REGISTER.md — Calipso.Coffee

| ID | Риск | Признак/доказательство | Вероятность | Влияние | Что сделать |
|----|------|------------------------|-------------|---------|-------------|
| R-01 | Проект недоступен после перезапуска | Контейнер не поднялся, EADDRINUSE | Средняя | Высокое | `restart: unless-stopped`, `make deploy-restart`, проверка логов |
| R-02 | Ошибки API → 500 | Необработанные исключения | Средняя | Высокое | JSON error handler, API-тесты, DEFECT_LOG |
| R-03 | Слабый JWT_SECRET | `change_me` в demo/production example | Высокая | Высокое | Уникальный секрет в `.env.production`, не коммитить |
| R-04 | SQLite не масштабируется | Одна файловая БД, volume Docker | Средняя | Среднее | Для prod — PostgreSQL; backup volume |
| R-05 | Уязвимости npm-зависимостей | npm audit: 2 moderate | Средняя | Среднее | `npm audit fix`, регулярное обновление |
| R-06 | Медленная загрузка UI | Большой index.html inline CSS | Низкая | Низкое | Lighthouse, оптимизация статики |
| R-07 | Логи не помогают диагностике | morgan dev-формат без уровней | Средняя | Среднее | Структурированные логи, `reports/logs_tail.txt` |

## Связь с этапом 4

Риски выявлены при: API-тестах, npm test, docker logs, performance curl, DEFECT_LOG.
