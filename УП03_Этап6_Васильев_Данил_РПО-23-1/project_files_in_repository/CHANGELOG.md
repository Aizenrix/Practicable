# CHANGELOG.md

## [1.0.1] - 2026-06-10

### Fixed

- Исправлена обработка протухшего/неверного JWT при восстановлении сессии в UI (BUG-06): больше нет `console.error` в DevTools, токен очищается, показывается форма входа.

### Added

- GitHub Actions CI (`.github/workflows/ci.yml`): lint, тесты, build при push и pull request.
- Команды `make build`, `make release-check` и скрипты `build.bat`, `release-check.bat`, `create-release.bat`.

### Verified

- Локально: `make check`, `make release-check`
- CI: GitHub Actions workflow `CI`

## [1.0.0] - 2026-06-10

### Added

- Backend Calipso.Coffee (Express, Prisma, SQLite), SPA, Docker demo/prod.
- Этапы УП.03: запуск, deploy, тестирование, безопасность.
