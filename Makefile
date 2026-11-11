.PHONY: init keys up down restart logs ps psql

init:
	@cp -n .env.example .env || true
	@bash infra/scripts/gen-jwt-keys.sh
	@echo "✅ Inisialisasi .env dan kunci RS256 selesai."

keys:
	@bash infra/scripts/gen-jwt-keys.sh

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose down && docker compose up -d

ps:
	docker compose ps

logs:
	docker compose logs -f --tail=100

psql:
	docker compose exec postgres psql -U $${POSTGRES_USER:-smartschool} -d $${POSTGRES_DB:-smartschool_db}

