Скриншоты этапа 5 (12 шт.):

01_gitignore_no_env.png          — .gitignore: .env, backups, logs, dumps
02_env_example_without_secrets.png — JWT_SECRET=change_me, без реальных ключей
03_secret_scan_result.png        — make security-check / git grep
04_dependency_check_result.png   — make deps-check / npm audit
05_roles_access_check.png        — WAITER 403 на /api/users, ADMIN 200
06_foreign_data_access_denied.png — GET /api/orders/:id чужого = 403
07_cors_or_security_config.png   — .env.production.example CORS_ORIGIN, app.js
08_backup_created.png            — backups/backup_*.db или make backup
09_restore_success.png           — make restore + health 200
10_open_ports_check.png          — docker ps / make ports-check
11_logs_no_critical_errors.png   — make logs-security
12_security_commit.png           — git log этапа 5
