# Calipso.Coffee Backend (Node.js)

Серверная часть системы учета заказов кафе на чистом `Node.js` (JavaScript), `Express` и `Prisma` (SQLite).

## Что реализовано

- Авторизация с JWT и ролями (`WAITER`, `CHEF`, `ADMIN`, `MANAGER`).
- Модули: авторизация, пользователи, клиенты, столы, статусы, способы оплаты, меню, ингредиенты/рецептуры, заказы, оплаты, отчеты.
- База данных по сущностям из этапов: роли, пользователи, клиенты, столы, меню, заказы, элементы заказа, статусы, оплаты, ингредиенты, рецептуры.

## Быстрый старт

Подробная инструкция: [INSTALL.md](INSTALL.md)

### Windows (BAT)

```bat
scripts\setup.bat
scripts\run.bat
```

### macOS / Linux (Makefile)

```bash
make setup
make run
```

### npm напрямую

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

Открыть: **http://localhost:4000**

### Docker

```bash
cp .env.example .env
docker compose up --build
```

Или: `make docker-up` / `scripts\docker-up.bat`

### Проверка и форматирование

```bash
make check    # ESLint + тесты
make format   # Prettier
```

## Команды проекта

| Действие    | BAT (Windows)             | Makefile           | npm / Docker                |
| ----------- | ------------------------- | ------------------ | --------------------------- |
| Установка   | `scripts\setup.bat`       | `make setup`       | `npm install`               |
| Запуск      | `scripts\run.bat`         | `make run`         | `npm run dev`               |
| Проверка    | `scripts\check.bat`       | `make check`       | `npm run check`             |
| Формат      | `scripts\format.bat`      | `make format`      | `npm run format`            |
| Docker UP   | `scripts\docker-up.bat`   | `make docker-up`   | `docker compose up --build` |
| Docker DOWN | `scripts\docker-down.bat` | `make docker-down` | `docker compose down`       |
| Логи        | `scripts\logs.bat`        | `make logs`        | `docker compose logs -f`    |

## Вход по умолчанию

- Email: `admin@calipso.coffee`
- Пароль: `admin123`

## Основные endpoint'ы

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST /api/users`
- `GET/POST/PATCH /api/clients`
- `GET/POST /api/reference/tables`
- `PATCH /api/reference/tables/:id/occupancy`
- `GET/POST /api/menu/categories`
- `GET/POST /api/menu/items`
- `PATCH /api/menu/items/:id/availability`
- `GET/POST/PATCH /api/inventory/ingredients`
- `GET/POST /api/inventory/recipes`
- `GET/POST /api/orders`
- `PATCH /api/orders/:id/status`
- `GET/POST /api/payments`
- `GET /api/reports/summary`
- `GET /api/reports/orders-by-status`
- `GET /api/reports/tables-load`
