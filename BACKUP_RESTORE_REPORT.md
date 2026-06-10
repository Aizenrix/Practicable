# BACKUP_RESTORE_REPORT.md — Calipso.Coffee

## Тип хранилища

SQLite (`prisma/dev.db` локально, `/data/dev.db` в Docker volume `calipso_prod_data`).

## Backup

**Команда:** `make backup` или `./scripts/backup.sh`

**Что копируется:** файл SQLite БД со всеми заказами, пользователями, меню.

**Куда:** `backups/backup_YYYYMMDD_HHMMSS.db`  
**Метка последнего:** `backups/LATEST.txt`

**Пример вывода:** `reports/security_backup.txt`

## Restore

**Команда:** `make restore` или `./scripts/restore.sh backups/backup_....db`

**Процедура:**
1. Остановить приложение (или контейнер при Docker-restore).
2. Скопировать backup поверх `prisma/dev.db` (или в volume).
3. Запустить `make run` / `make deploy`.
4. Проверить `curl http://localhost:4000/health` и вход admin@calipso.coffee.

**Пример вывода:** `reports/security_restore.txt`

## Результат проверки

| Шаг | Результат |
|-----|-----------|
| Backup создан | файл в `backups/`, размер > 0 |
| Данные после restore | health 200, seed-пользователи доступны |
| Приложение работает | UI и API отвечают |

## Рекомендации

- Регулярный cron backup volume на VPS.
- Хранить backups вне репозитория (`.gitignore`).
- Для production рассмотреть PostgreSQL + `pg_dump`.
