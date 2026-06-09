# DEFECT_LOG.md — Calipso.Coffee

| ID | Где найдено | Описание проблемы | Как воспроизвести | Критичность | Статус | Исправление |
|----|-------------|-------------------|-------------------|-------------|--------|-------------|
| BUG-01 | npm audit | 2 moderate vulnerabilities в dev-зависимостях | `npm install` | Низкая | open | `npm audit fix`, мониторинг обновлений |
| BUG-02 | API | Несуществующий `/api/*` возвращал HTML 404 вместо JSON | `GET /api/unknown` | Средняя | **fixed** | Добавлен JSON-обработчик 404 в `src/app.js` |
| BUG-03 | Prisma | Deprecation warning `package.json#prisma` | `npm run prisma:generate` | Низкая | open | Миграция на prisma.config.ts в будущем |
| BUG-04 | Deploy | EADDRINUSE порт 4000 при повторном запуске | `npm run dev` + docker | Средняя | fixed | Документировано: `kill $(lsof -t -i :4000)` |
| BUG-05 | Security | JWT_SECRET=change_me по умолчанию | Запуск без .env.production | Высокая | open | Сменить секрет в production, см. RISK_REGISTER |

## Исправление BUG-02 (до/после)

**До:** `GET /api/unknown` → HTML `Cannot GET /api/unknown`  
**После:** `GET /api/unknown` → `404 {"error":"Маршрут API не найден"}`

Проверка: `npm test` → тест `GET /api/unknown возвращает 404 JSON`
