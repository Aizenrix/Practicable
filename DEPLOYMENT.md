# DEPLOYMENT.md — Calipso.Coffee

## 1. Где развернут проект

**Вариант:** C — локальный demo/production-стенд через Docker  
**Адрес:** http://localhost:4000  
**Health-check:** http://localhost:4000/health

Проект развёрнут как сервис в Docker-контейнере (`docker-compose.prod.yml`), доступен вне IDE через браузер.

## 2. Требования

| Компонент | Версия |
|-----------|--------|
| Docker Desktop / Docker Engine | 24+ |
| Docker Compose | v2+ |
| Git | любая актуальная |
| Порты | 4000 (HTTP) |
| БД | SQLite (volume `calipso_prod_data`) |

## 3. Переменные окружения

```bash
cp .env.production.example .env.production
# или для демо:
cp .env.demo.example .env.production
```

| Переменная | Назначение |
|------------|------------|
| `APP_ENV` | `production` или `demo` |
| `APP_DEBUG` | `false` |
| `PORT` | Порт сервиса (4000) |
| `JWT_SECRET` | Секрет JWT (сменить в prod!) |
| `DATABASE_URL` | `file:/data/dev.db` в Docker |

## 4. Команды развертывания

### Windows

```bat
scripts\deploy.bat
```

### macOS / Linux

```bash
chmod +x scripts/deploy.sh scripts/restart.sh scripts/check_deploy.sh
./scripts/deploy.sh
```

### Или Makefile

```bash
make deploy
```

### Вручную

```bash
git clone https://github.com/Aizenrix/Practicable.git
cd Practicable
cp .env.production.example .env.production
docker compose -f docker-compose.prod.yml up --build -d
docker compose -f docker-compose.prod.yml ps
```

## 5. Проверка

- **Приложение:** http://localhost:4000
- **API health:** `curl http://localhost:4000/health`
- **Статус контейнеров:** `docker compose -f docker-compose.prod.yml ps`
- **Логи:** `docker compose -f docker-compose.prod.yml logs --tail=80`

### Основной сценарий

1. Открыть http://localhost:4000
2. Войти: `admin@calipso.coffee` / `admin123`
3. Проверить раздел «Сводка» и «Заказы»

## 6. Остановка и перезапуск

```bash
# Остановка
docker compose -f docker-compose.prod.yml down
# или: make deploy-down / scripts\restart.bat (цикл)

# Перезапуск
docker compose -f docker-compose.prod.yml up --build -d
# или: make deploy-restart / scripts\restart.bat
```

## 7. VPS + Nginx (опционально)

1. Скопировать проект на сервер: `/opt/calipso-coffee`
2. Запустить `docker compose -f docker-compose.prod.yml up -d`
3. Подключить `nginx/project.conf` как reverse proxy на порт 4000
4. Автозапуск: `systemd/calipso-coffee.service`

## 8. Release-архив

```bash
make build-release
# или scripts\build_release.bat
```

Архив: `release/project_release.zip`
