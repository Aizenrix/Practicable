# INCIDENT_REPORT.md — Calipso.Coffee

## 1. Инцидент

**BUG-06:** При открытии приложения с устаревшим токеном в `localStorage` в DevTools Console появляется красная ошибка `Error: Неверный токен`, хотя для пользователя это штатная ситуация (сессия истекла).

## 2. Где обнаружено

Demo-стенд `http://localhost:4000` (Docker `docker-compose.prod.yml`), браузер Chrome, вкладка Console.

## 3. Как воспроизвести

1. Войти как `admin@calipso.coffee`.
2. В DevTools → Application → Local Storage удалить или изменить значение `token` (либо подставить невалидную строку).
3. Обновить страницу (F5).
4. **До исправления:** Console — красный `Error: Неверный токен`, UI показывает сообщение об истёкшей сессии.

## 4. Диагностика

| Источник | Находка |
|----------|---------|
| DevTools Console | `console.error(error)` в `public/app.js` при старте |
| Network | `GET /api/auth/me` → 401 `{"error":"Неверный токен"}` |
| Docker logs | `GET /api/auth/me 401` — ожидаемый ответ API |
| Код | Блок `(async () => { ... loadCurrentUser() ... })()` ловил 401 как исключение и логировал через `console.error` |

## 5. Причина

Фронтенд трактовал ожидаемый 401 при невалидном JWT как неожиданную ошибку и вызывал `console.error`, хотя API отрабатывает корректно.

## 6. Исправление

- `public/app.js`: функции `isExpectedAuthError()`, `clearSession()`.
- При 401 «Неверный токен» — очистка `localStorage`, показ формы входа, **без** `console.error`.
- Ветка: `support/fix-invalid-token-session`.

## 7. Проверка

```bash
make check
make release-check
```

GitHub Actions: workflow `CI` на push/PR.

## 8. Итог

**Исправлено.** Протухшая сессия обрабатывается штатно, Console без ложных критических ошибок.
