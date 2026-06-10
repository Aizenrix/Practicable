# RELEASE_NOTES.md — Calipso.Coffee v1.0.1

**Дата:** 10.06.2026  
**Версия:** 1.0.1  
**Студент:** Васильев Данил Вячеславович, группа РПО 23/1

## Что изменилось

Релиз поддержки (этап 6 УП.03): исправлен инцидент с протухшим JWT в браузере и добавлен автоматический CI.

## Что исправлено

- **BUG-06:** при невалидном токене в `localStorage` приложение больше не пишет красную ошибку в Console; сессия корректно сбрасывается, пользователь видит форму входа.
- Добавлен GitHub Actions workflow для `npm run check` и `npm run build` на каждый push/PR.

## Как проверить

1. Запустить стенд: `make deploy` или `docker compose -f docker-compose.prod.yml up -d`.
2. Открыть http://localhost:4000, войти как admin.
3. В DevTools → Application → Local Storage изменить `token` на `invalid`.
4. Обновить страницу — Console **без** красной ошибки, сообщение «Сессия истекла…», форма входа видна.
5. Локально: `make check`, `make release-check`.

## Ограничения

- SQLite и demo JWT_SECRET — как в v1.0.0.
- `npm audit` moderate — в плане обновления зависимостей.

## История этапов УП.03

| Этап | Результат |
|------|-----------|
| 1–3 | Аудит, Docker, deploy |
| 4 | Тестирование, DEFECT_LOG |
| 5 | Безопасность, backup |
| 6 | Issue → fix → CI → PR → релиз 1.0.1 |
