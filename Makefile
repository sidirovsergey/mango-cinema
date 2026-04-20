.PHONY: up down ps logs restart clean migrate dev test lint format

up:
	docker compose up -d
	@echo "Waiting for services to be healthy..."
	@docker compose ps

down:
	docker compose down

ps:
	docker compose ps

logs:
	docker compose logs -f

restart:
	docker compose restart

clean:
	docker compose down -v

migrate:
	pnpm --filter @mango/db run migrate

dev:
	pnpm --filter @mango/api run dev

test:
	pnpm run test

lint:
	pnpm run lint

format:
	pnpm run format
