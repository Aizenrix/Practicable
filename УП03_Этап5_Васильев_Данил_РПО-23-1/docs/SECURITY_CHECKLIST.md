# SECURITY_CHECKLIST.md — Calipso.Coffee

| Проверка | Статус | Доказательство | Что исправлено |
|----------|--------|----------------|----------------|
| .env не загружен в Git | выполнено | скриншот 01 | `.env`, `.env.production` в `.gitignore` |
| .env.example без реальных секретов | выполнено | скриншот 02 | `JWT_SECRET=change_me`, примеры localhost |
| Ручной поиск секретов выполнен | выполнено | скриншот 03 | `reports/security_secret_scan.txt`, только примеры |
| Зависимости проверены | выполнено | скриншот 04 | `npm audit`: 2 moderate (qs), зафиксировано в RISK_REGISTER |
| Проверены роли | выполнено | скриншот 05 | WAITER → `/api/users` = 403; ADMIN = 200 |
| Проверен доступ к чужим данным | выполнено | скриншот 06 | `GET /api/orders/:id` чужого заказа = 403 |
| CORS/hosts/debug проверены | выполнено | скриншот 07 | `CORS_ORIGIN` в production, `APP_DEBUG=false` |
| Backup создан | выполнено | скриншот 08 | `scripts/backup.sh`, папка `backups/` |
| Restore проверен | выполнено | скриншот 09 | `scripts/restore.sh`, `reports/security_restore.txt` |
| Открытые порты проверены | выполнено | скриншот 10 | только 4000 (docker prod), `reports/security_ports.txt` |
| Логи без критических ошибок | выполнено | скриншот 11 | `reports/security_logs.txt` |

**Дата проверки:** этап 5 УП.03  
**Инструменты:** git grep, npm audit, curl, docker ps, backup/restore scripts
