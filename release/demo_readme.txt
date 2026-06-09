Calipso.Coffee — Release / Demo пакет
======================================

Быстрый запуск (Docker):
  1. cp .env.production.example .env.production
  2. docker compose -f docker-compose.prod.yml up --build -d
  3. Открыть http://localhost:4000

Windows:
  scripts\deploy.bat

macOS/Linux:
  chmod +x scripts/deploy.sh && ./scripts/deploy.sh

Вход: admin@calipso.coffee / admin123

Подробнее: DEPLOYMENT.md, DEMO_GUIDE.md
