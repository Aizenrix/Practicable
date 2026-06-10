# RECOMMENDATIONS.md — Calipso.Coffee (этап 5)

## Краткосрочно

1. **JWT_SECRET** — уникальный секрет в `.env.production` (не `change_me`).
2. **npm audit fix** — устранить moderate в `qs` / `express`.
3. **HTTPS** — Nginx + Let's Encrypt на VPS (конфиг в `nginx/`).
4. **Автоматический backup** — cron `make backup` раз в сутки.

## Среднесрочно

5. **CI security** — GitHub Actions: `npm audit`, secret scan, `npm test`.
6. **Rate limiting** — ограничение `/api/auth/login`.
7. **Мониторинг** — алерты при падении healthcheck.
8. **Аудит прав** — пересмотр ролей CHEF/WAITER при росте команды.

## Долгосрочно

9. **PostgreSQL** вместо SQLite для production.
10. **Централизованные логи** (JSON + уровни, без паролей в логах).
11. **2FA** для администраторов.
12. **Penetration test** перед публичным релизом.

## Что оставлено как риск (осознанно)

- Demo-стенд на `localhost:4000` без HTTPS — допустимо для учебного стенда.
- 2 moderate npm audit — зафиксировано в RISK_REGISTER, план обновления.
