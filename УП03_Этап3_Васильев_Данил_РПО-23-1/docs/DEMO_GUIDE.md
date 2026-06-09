# DEMO_GUIDE.md — Calipso.Coffee

## Как быстро проверить проект (для преподавателя)

### Вариант 1: Docker demo-стенд (рекомендуется)

1. Клонировать репозиторий или открыть `release/project_release.zip`
2. Выполнить:
   ```bash
   cp .env.production.example .env.production
   docker compose -f docker-compose.prod.yml up --build -d
   ```
3. Открыть: **http://localhost:4000**

### Вариант 2: Release-архив

1. Распаковать `release/project_release.zip`
2. Следовать `release/demo_readme.txt`
3. Запустить `scripts/deploy.bat` или `make deploy`

## Тестовые данные

| Поле | Значение |
|------|----------|
| Email | `admin@calipso.coffee` |
| Пароль | `admin123` |
| Роль | Администратор |

## Основной сценарий проверки

1. **Вход** — авторизация на главной странице
2. **Сводка** — отображаются метрики (заказы, выручка)
3. **Заказы** — список заказов загружается
4. **Меню** — позиции меню отображаются
5. **Health API** — `GET /health` → `{"status":"ok"}`

## Что считается успешной проверкой

- Приложение открывается по http://localhost:4000
- Вход выполняется без ошибок
- Разделы «Сводка» и «Заказы» работают
- `docker compose -f docker-compose.prod.yml ps` — контейнер `running`
- Логи без критических `Error` / `fatal`
- Перезапуск (`scripts/restart.bat` / `make deploy-restart`) проходит успешно

## Проверка перезапуска

```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up --build -d
curl http://localhost:4000/health
```
