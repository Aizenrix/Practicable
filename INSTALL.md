# Calipso.Coffee — инструкция установки (УП.03 Этап 2)

## Требования

- Node.js 18+ (рекомендуется 22.x)
- npm 9+
- Git
- Docker Desktop (для запуска в контейнере)
- Make (macOS/Linux) или BAT-скрипты (Windows)

## Быстрый запуск (локально)

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
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

Приложение: **http://localhost:4000**  
Логин: `admin@calipso.coffee` / `admin123`

## Запуск через Docker

```bash
cp .env.example .env
docker compose up --build
```

Остановка:

```bash
docker compose down
```

Или через Makefile:

```bash
make docker-up
make docker-down
make logs
```

## Проверка качества

```bash
make check
# или
scripts\check.bat   # Windows
npm run check
```

## Форматирование кода

```bash
make format
# или
scripts\format.bat  # Windows
npm run format
```

## Переменные окружения (.env.example)

| Переменная     | Пример          | Назначение                  |
| -------------- | --------------- | --------------------------- |
| `PORT`         | `4000`          | Порт HTTP-сервера           |
| `JWT_SECRET`   | `change_me`     | Секрет JWT (сменить в prod) |
| `DATABASE_URL` | `file:./dev.db` | SQLite (локально)           |

В Docker `DATABASE_URL` переопределяется на `file:/data/dev.db` через `docker-compose.yml`.
