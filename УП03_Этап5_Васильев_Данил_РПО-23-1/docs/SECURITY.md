# Безопасность Calipso.Coffee

## Секреты

- Не коммитьте `.env`, `.env.production`, дампы БД и папку `backups/`.
- Используйте `.env.example` и `.env.production.example` с placeholder-значениями (`change_me`).
- Перед push: `make security-check`.

## Роли и доступ

| Роль | Доступ |
|------|--------|
| ADMIN, MANAGER | Пользователи, отчёты, все заказы |
| WAITER | Свои заказы, клиенты, оплаты |
| CHEF | Смена статуса заказов (кухня) |

Проверка владельца заказа: `GET/PATCH /api/orders/:id` — официант не видит чужие заказы (403).

## CORS и production

- В production задайте `CORS_ORIGIN=http://your-domain.com` (не `*`).
- `NODE_ENV=production`, `APP_DEBUG=false` в `.env.production`.
- Ошибки 500 не раскрывают stack trace в production.

## Зависимости

```bash
make deps-check
npm audit fix   # при необходимости
```

## Резервное копирование (SQLite)

```bash
make backup
make restore    # восстановление из последнего backup
```

## Проверки этапа 5

```bash
make security-check
make deps-check
make backup
make restore
make ports-check
make logs-security
```
