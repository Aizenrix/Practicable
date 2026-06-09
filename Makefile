.PHONY: setup run check format docker-build docker-up docker-down logs clean help

help:
	@echo "Calipso.Coffee — команды проекта"
	@echo "  make setup        — установка зависимостей и Prisma Client"
	@echo "  make run          — локальный запуск (push + seed + dev)"
	@echo "  make check        — линтер ESLint + unit-тесты"
	@echo "  make format       — форматирование Prettier"
	@echo "  make docker-build — сборка Docker-образа"
	@echo "  make docker-up    — docker compose up --build"
	@echo "  make docker-down  — docker compose down"
	@echo "  make logs         — docker compose logs -f"
	@echo "  make clean        — удаление временных артефактов"

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

clean:
	rm -rf node_modules/.cache
	@echo "Clean complete (node_modules сохранён)"
