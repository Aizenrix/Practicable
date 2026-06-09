# RELEASE_NOTES.md — Calipso.Coffee v1.0.0

**Дата:** 10.06.2026  
**Версия:** 1.0.0  
**Студент:** Васильев Данил Вячеславович, группа РПО 23/1

## Что вошло в релиз

- Backend API на Node.js + Express + Prisma (SQLite)
- Веб-интерфейс: 9 разделов управления кафе
- JWT-авторизация с ролями (WAITER, CHEF, ADMIN, MANAGER)
- Docker demo/production-стенд (`docker-compose.prod.yml`)
- Скрипты развертывания: deploy, restart, check_deploy, build_release
- Production/demo конфигурация: `.env.production.example`, `.env.demo.example`
- Nginx reverse proxy config, systemd unit (для VPS)
- ESLint + Prettier + unit-тесты

## Как запустить

```bash
cp .env.production.example .env.production
docker compose -f docker-compose.prod.yml up --build -d
```

Открыть: http://localhost:4000

## Известные ограничения

- SQLite — файловая БД, не для высоких нагрузок в production
- JWT_SECRET по умолчанию — заменить в реальном окружении
- Демо-стенд работает на localhost:4000 (без внешнего VPS)
- `npm audit` может показывать 2 moderate vulnerabilities в dev-зависимостях

## История этапов УП.03

| Этап | Результат |
|------|-----------|
| 1 | Входной аудит, инструкции, журнал проблем |
| 2 | Makefile, BAT, Docker, ESLint, Prettier |
| 3 | Production-развертывание, demo-стенд, release-архив |
