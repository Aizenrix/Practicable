# Calipso.Coffee Backend (Node.js)

Серверная часть системы учета заказов кафе на чистом `Node.js` (JavaScript), `Express` и `Prisma` (SQLite).

## Что реализовано

- Авторизация с JWT и ролями (`WAITER`, `CHEF`, `ADMIN`, `MANAGER`).
- Модули: пользователи, столы, статусы, способы оплаты, меню, заказы, оплаты, отчеты.
- База данных по сущностям из этапов: роли, пользователи, клиенты, столы, меню, заказы, элементы заказа, статусы, оплаты, ингредиенты, рецептуры.

## Быстрый старт

1. Скопировать пример переменных окружения:

```bash
cp .env.example .env
```

2. Установить зависимости:

```bash
npm install
```

3. Сгенерировать Prisma client и создать БД:

```bash
npm run prisma:generate
npm run prisma:push
```

4. Заполнить базу начальными данными:

```bash
npm run prisma:seed
```

5. Запустить API:

```bash
npm run dev
```

## Вход по умолчанию

- Email: `admin@calipso.coffee`
- Пароль: `admin123`

## Основные endpoint'ы

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST /api/users`
- `GET/POST /api/reference/tables`
- `PATCH /api/reference/tables/:id/occupancy`
- `GET/POST /api/menu/categories`
- `GET/POST /api/menu/items`
- `PATCH /api/menu/items/:id/availability`
- `GET/POST /api/orders`
- `PATCH /api/orders/:id/status`
- `POST /api/payments`
- `GET /api/reports/summary`
