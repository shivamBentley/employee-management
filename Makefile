.DEFAULT_GOAL := help
COMPOSE := docker compose

# ─────────────────────────────────────────────────────────────────────────────
#  Employee Management System — Makefile
#
#  Usage:
#    make start       → check requirements, build images, start all services
#    make stop        → stop all running containers
#    make restart     → stop then start
#    make rebuild     → force rebuild images and restart
#    make clean-start → stop, wipe volumes & cache, rebuild, start fresh (keeps images)
#    make logs        → tail logs from all containers
#    make shell       → open a bash shell inside the backend container
#    make migrate     → run migrations manually
#    make seed        → run database seeders manually
#    make fresh       → drop all tables, re-migrate and seed (⚠ destructive)
#    make clean       → stop containers and remove volumes (⚠ destructive)
#    make status      → show container health status
#    make help        → show this help
# ─────────────────────────────────────────────────────────────────────────────

##@ Requirements check

.PHONY: check-requirements
check-requirements:
	@echo ""
	@echo "════════════════════════════════════════════════"
	@echo "  Checking requirements..."
	@echo "════════════════════════════════════════════════"
	@command -v docker > /dev/null 2>&1 \
		|| { echo "  ✗  Docker is not installed. Install it from https://docs.docker.com/get-docker/"; exit 1; }
	@echo "  ✓  Docker found: $$(docker --version)"
	@docker info > /dev/null 2>&1 \
		|| { echo "  ✗  Docker daemon is not running. Please start Docker Desktop."; exit 1; }
	@echo "  ✓  Docker daemon is running"
	@docker compose version > /dev/null 2>&1 \
		|| { echo "  ✗  Docker Compose plugin not found. Update Docker Desktop or install the Compose plugin."; exit 1; }
	@echo "  ✓  Docker Compose found: $$(docker compose version --short)"
	@echo "  ✓  All requirements satisfied!"
	@echo "════════════════════════════════════════════════"
	@echo ""

##@ Main targets

.PHONY: start
start: check-requirements   ## ★ Check requirements → build → start everything (first-time & subsequent)
	@echo ""
	@echo "════════════════════════════════════════════════"
	@echo "  Building and starting Employee Management System"
	@echo "  (equivalent to: docker compose up --build -d)"
	@echo "════════════════════════════════════════════════"
	$(COMPOSE) up --build -d
	@echo ""
	@echo "  Waiting for backend to become healthy..."
	@until [ "$$(docker inspect --format='{{.State.Health.Status}}' ems_backend 2>/dev/null)" = "healthy" ]; do \
		printf '.'; sleep 2; \
	done
	@echo ""
	@echo "════════════════════════════════════════════════"
	@echo "  ✓  All services are up and healthy!"
	@echo ""
	@echo "  Frontend  →  http://localhost:3000"
	@echo "  Backend   →  http://localhost:8000"
	@echo "  WebSocket →  ws://localhost:8080"
	@echo ""
	@echo "  Default login:"
	@echo "    Email:    admin@company.com"
	@echo "    Password: Admin@123"
	@echo ""
	@echo "  Tip: run 'make logs' to watch live output."
	@echo "════════════════════════════════════════════════"

.PHONY: stop
stop:   ## Stop all containers
	$(COMPOSE) down

.PHONY: restart
restart: stop start   ## Stop then start

.PHONY: rebuild
rebuild: check-requirements   ## Force rebuild all images and restart
	$(COMPOSE) down
	$(COMPOSE) build --no-cache
	$(COMPOSE) up -d
	@echo "  ✓  Rebuild complete."

.PHONY: build-fe
build-fe:   ## Rebuild frontend and hot-deploy to running nginx container
	cd frontend && npm run build
	$(COMPOSE) cp frontend/dist/. frontend:/usr/share/nginx/html/
	$(COMPOSE) exec frontend nginx -s reload
	@echo "  ✓  Frontend deployed to http://localhost:3000"

##@ Logs & status

.PHONY: logs
logs:   ## Tail logs from all containers (Ctrl-C to exit)
	$(COMPOSE) logs -f

.PHONY: logs-backend
logs-backend:   ## Tail backend container logs only
	$(COMPOSE) logs -f backend

.PHONY: logs-frontend
logs-frontend:   ## Tail frontend container logs only
	$(COMPOSE) logs -f frontend

.PHONY: status
status:   ## Show container health and status
	$(COMPOSE) ps

##@ Database

.PHONY: migrate
migrate:   ## Run database migrations inside the backend container
	$(COMPOSE) exec backend php artisan migrate --force

.PHONY: seed
seed:   ## Run database seeders inside the backend container
	$(COMPOSE) exec backend php artisan db:seed --force

.PHONY: fresh
fresh:   ## ⚠ Drop all tables, re-migrate and re-seed (destroys data)
	@echo "WARNING: This will destroy all data. Press Ctrl-C within 5s to cancel."
	@sleep 5
	$(COMPOSE) exec backend php artisan migrate:fresh --seed --force

##@ Shell access

.PHONY: shell
shell:   ## Open interactive bash shell in the backend container
	$(COMPOSE) exec backend bash

.PHONY: tinker
tinker:   ## Open Laravel Tinker REPL
	$(COMPOSE) exec backend php artisan tinker

##@ Cleanup

.PHONY: clean
clean:   ## ⚠ Stop containers AND remove all named volumes (destroys database)
	@echo "WARNING: This will remove all volumes including the database. Press Ctrl-C within 5s to cancel."
	@sleep 5
	$(COMPOSE) down -v
	@echo "  ✓  Containers and volumes removed."

.PHONY: clean-start
clean-start: check-requirements   ## ⚠ Stop containers, wipe volumes & cache, rebuild and start fresh (images kept)
	@echo ""
	@echo "════════════════════════════════════════════════"
	@echo "  Clean-start: stopping containers..."
	@echo "════════════════════════════════════════════════"
	$(COMPOSE) down -v --remove-orphans
	@echo "  ✓  Containers and volumes removed."
	@echo ""
	@echo "  Pruning dangling build cache (not images)..."
	docker builder prune -f
	@echo "  ✓  Build cache cleared."
	@echo ""
	@echo "  Removing backend framework cache..."
	@rm -rf backend/bootstrap/cache/*.php || true
	@echo "  ✓  Laravel bootstrap cache cleared."
	@echo ""
	@echo "  Rebuilding and starting services..."
	@echo "════════════════════════════════════════════════"
	$(COMPOSE) up --build -d
	@echo ""
	@echo "  Waiting for backend to become healthy..."
	@until [ "$$(docker inspect --format='{{.State.Health.Status}}' ems_backend 2>/dev/null)" = "healthy" ]; do \
		printf '.'; sleep 2; \
	done
	@echo ""
	@echo "════════════════════════════════════════════════"
	@echo "  ✓  All services are up and healthy!"
	@echo ""
	@echo "  Frontend  →  http://localhost:3000"
	@echo "  Backend   →  http://localhost:8000"
	@echo "  WebSocket →  ws://localhost:8080"
	@echo ""
	@echo "  Default login:"
	@echo "    Email:    admin@company.com"
	@echo "    Password: Admin@123"
	@echo "════════════════════════════════════════════════"

##@ Help

.PHONY: help
help:   ## Show this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
