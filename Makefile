.PHONY: build up down logs shell-backend shell-frontend fresh clean

# Build containers
build:
	docker-compose build

# Start containers
up:
	docker-compose up -d

# Stop containers
down:
	docker-compose down

# Stop containers and remove volumes
down-v:
	docker-compose down -v

# View logs
logs:
	docker-compose logs -f

# View logs for specific service
logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-mysql:
	docker-compose logs -f mysql

# Access backend shell
shell-backend:
	docker-compose exec backend bash

# Access frontend shell
shell-frontend:
	docker-compose exec frontend sh

# Access MySQL shell
shell-mysql:
	docker-compose exec mysql mysql -u ems_user -p employee_management

# Fresh install (rebuild everything)
fresh:
	docker-compose down -v
	docker-compose build --no-cache
	docker-compose up -d
	@echo "Waiting for MySQL to be ready..."
	@sleep 30
	docker-compose exec backend php artisan key:generate
	docker-compose exec backend php artisan migrate:fresh --seed

# Clean up Docker system
clean:
	docker system prune -a -f
	docker volume prune -f

# Restart all services
restart:
	docker-compose restart

# Restart specific service
restart-backend:
	docker-compose restart backend

restart-frontend:
	docker-compose restart frontend

restart-mysql:
	docker-compose restart mysql

# Show running containers
ps:
	docker-compose ps