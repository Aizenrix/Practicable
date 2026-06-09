.PHONY: setup run check format docker-build docker-up docker-down logs clean help deploy deploy-down deploy-restart check-deploy build-release test api-test quality-check performance logs-check

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

clean:
	rm -rf node_modules/.cache
	@echo "Clean complete (node_modules сохранён)"
