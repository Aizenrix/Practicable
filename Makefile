.PHONY: setup run check format docker-build docker-up docker-down logs clean help deploy deploy-down deploy-restart check-deploy build-release test api-test quality-check performance logs-check security-check deps-check backup restore ports-check logs-security role-access-check

help:
	@echo "Calipso.Coffee — команды проекта"
	@echo "  make setup          — установка зависимостей и Prisma Client"
	@echo "  make run            — локальный запуск (push + seed + dev)"
	@echo "  make check          — линтер ESLint + unit-тесты"
	@echo "  make format         — форматирование Prettier"
	@echo "  make docker-build   — сборка Docker-образа"
	@echo "  make docker-up      — docker compose up --build"
	@echo "  make docker-down    — docker compose down"
	@echo "  make logs           — docker compose logs -f"
	@echo "  make deploy         — production/demo развертывание"
	@echo "  make deploy-down    — остановка prod-стенда"
	@echo "  make deploy-restart — перезапуск prod-стенда"
	@echo "  make check-deploy   — проверка статуса и логов"
	@echo "  make build-release  — сборка release/project_release.zip"
	@echo "  make test           — npm test (этап 4)"
	@echo "  make api-test       — проверка API curl + отчёт"
	@echo "  make quality-check  — test + api-test + logs"
	@echo "  make performance    — curl-замеры производительности"
	@echo "  make logs-check     — сохранить logs_tail.txt"
	@echo "  make security-check — поиск секретов (этап 5)"
	@echo "  make deps-check     — npm audit"
	@echo "  make backup         — backup SQLite"
	@echo "  make restore        — restore из backups/"
	@echo "  make ports-check    — docker ps и порты"
	@echo "  make logs-security  — логи безопасности"
	@echo "  make role-access-check — проверка ролей curl"
	@echo "  make clean          — удаление временных артефактов"

setup:
	@echo "Install dependencies"
	npm install
	npm run prisma:generate
	@test -f .env || cp .env.example .env

run:
	@echo "Run project locally"
	npm run prisma:push
	npm run prisma:seed
	npm run dev

check:
	@echo "Run checks"
	npm run check

format:
	@echo "Format code"
	npm run format

docker-build:
	docker compose build

docker-up:
	docker compose up --build

docker-down:
	docker compose down

logs:
	docker compose logs -f

deploy:
	@chmod +x scripts/deploy.sh 2>/dev/null || true
	./scripts/deploy.sh

deploy-down:
	docker compose -f docker-compose.prod.yml down

deploy-restart:
	@chmod +x scripts/restart.sh 2>/dev/null || true
	./scripts/restart.sh

check-deploy:
	@chmod +x scripts/check_deploy.sh 2>/dev/null || true
	./scripts/check_deploy.sh

build-release:
	@chmod +x scripts/build_release.sh 2>/dev/null || true
	./scripts/build_release.sh

test:
	npm test 2>&1 | tee reports/npm_test_report.txt

api-test:
	@chmod +x scripts/api-test.sh 2>/dev/null || true
	./scripts/api-test.sh

quality-check:
	@chmod +x scripts/quality-check.sh 2>/dev/null || true
	./scripts/quality-check.sh

performance:
	@chmod +x scripts/performance.sh 2>/dev/null || true
	./scripts/performance.sh

logs-check:
	@chmod +x scripts/logs-check.sh 2>/dev/null || true
	./scripts/logs-check.sh

security-check:
	@chmod +x scripts/security-check.sh 2>/dev/null || true
	./scripts/security-check.sh

deps-check:
	@chmod +x scripts/deps-check.sh 2>/dev/null || true
	./scripts/deps-check.sh

backup:
	@chmod +x scripts/backup.sh 2>/dev/null || true
	./scripts/backup.sh

restore:
	@chmod +x scripts/restore.sh 2>/dev/null || true
	./scripts/restore.sh

ports-check:
	@chmod +x scripts/ports-check.sh 2>/dev/null || true
	./scripts/ports-check.sh

logs-security:
	@chmod +x scripts/logs-security.sh 2>/dev/null || true
	./scripts/logs-security.sh

role-access-check:
	@chmod +x scripts/role-access-check.sh 2>/dev/null || true
	./scripts/role-access-check.sh

clean:
	rm -rf node_modules/.cache
	@echo "Clean complete (node_modules сохранён)"
