# 🐳 Docker Setup for Employee Management System

This Docker setup provides a simple way for developers to build and run the entire Employee Management System with just a few commands.

## 📋 What's Included

- **MySQL 8.0** - Database server
- **PHP 8.2 with Laravel** - Backend API
- **Node.js 18 with React** - Frontend application
- **Automatic setup scripts** - For easy deployment

## 🚀 Quick Start

### Option 1: Automatic Setup (Recommended)

**For Windows:**
```bash
setup.bat
```

**For Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

1. **Build and start containers:**
   ```bash
   docker-compose up --build -d
   ```

2. **Wait for MySQL to initialize (about 30 seconds)**

3. **Setup Laravel:**
   ```bash
   docker-compose exec backend php artisan key:generate
   docker-compose exec backend php artisan migrate --seed
   ```

## 🌐 Access Your Application

Once setup is complete, you can access:

- **Frontend (React)**: http://localhost:3000
- **Backend (Laravel API)**: http://localhost:8000
- **Database**: localhost:3307

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@admin.com | admin123 |
| Manager | manager@company.com | manager123 |
| Employee | employee@company.com | employee123 |

## 🛠️ Useful Commands

### Basic Docker Commands
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart
```

### Using Makefile (if available)
```bash
# Start services
make up

# Stop services
make down

# Fresh install (rebuild everything)
make fresh

# View logs
make logs

# Access backend shell
make shell-backend

# Access frontend shell
make shell-frontend
```

### Service-Specific Commands
```bash
# Backend shell access
docker-compose exec backend bash

# Frontend shell access
docker-compose exec frontend sh

# MySQL shell access
docker-compose exec mysql mysql -u ems_user -p employee_management

# Run Laravel commands
docker-compose exec backend php artisan migrate
docker-compose exec backend php artisan tinker
```

## 🗂️ Project Structure

```
employee-management-system/
├── docker-compose.yml          # Main Docker orchestration
├── setup.sh / setup.bat       # Setup scripts
├── Makefile                    # Optional command shortcuts
├── backend/
│   ├── Dockerfile             # Laravel/PHP container
│   ├── .dockerignore          # Docker ignore rules
│   └── ...                    # Laravel application
├── frontend/
│   ├── Dockerfile             # React/Node container
│   ├── .dockerignore          # Docker ignore rules
│   └── ...                    # React application
└── docker/                    # Docker configuration (legacy)
```

## 🔧 Configuration Details

### Database Configuration
- **Database**: employee_management
- **Username**: ems_user
- **Password**: ems_pass
- **Host**: mysql (internal), localhost:3307 (external)

### Environment Variables
The setup automatically configures:
- Backend `.env` for Docker networking
- Frontend `.env` for API connections

## 🐛 Troubleshooting

### Common Issues

**1. Port already in use:**
```bash
# Change ports in docker-compose.yml if needed
ports:
  - "3001:3000"  # Instead of 3000:3000
  - "8001:8000"  # Instead of 8000:8000
```

**2. MySQL connection issues:**
```bash
# Wait longer for MySQL to initialize
sleep 60

# Or restart the backend service
docker-compose restart backend
```

**3. Permission issues (Linux/Mac):**
```bash
sudo chown -R $USER:$USER backend/storage
sudo chmod -R 775 backend/storage
```

**4. Clear everything and start fresh:**
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Viewing Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

## 🔄 Development Workflow

### Making Changes

**Backend changes:**
- Edit files in `./backend/`
- Changes are reflected immediately (volume mounted)
- For dependency changes: `docker-compose exec backend composer install`

**Frontend changes:**
- Edit files in `./frontend/`
- Changes trigger hot reload automatically
- For dependency changes: `docker-compose exec frontend npm install`

### Database Operations
```bash
# Run migrations
docker-compose exec backend php artisan migrate

# Seed database
docker-compose exec backend php artisan db:seed

# Reset database
docker-compose exec backend php artisan migrate:fresh --seed
```

## 📦 What Each Container Does

### MySQL Container
- Runs MySQL 8.0 database server
- Stores all application data
- Accessible on port 3307

### Backend Container
- Runs Laravel with PHP 8.2
- Serves API endpoints on port 8000
- Handles authentication, business logic

### Frontend Container
- Runs React development server
- Serves UI on port 3000
- Connects to backend API

## 🚀 For Production

This setup is for development. For production:

1. **Use production-ready images**
2. **Add NGINX as reverse proxy**
3. **Use environment-specific configs**
4. **Enable SSL/HTTPS**
5. **Use Docker secrets for passwords**
6. **Add health checks**
7. **Use Docker Swarm or Kubernetes**

## 📝 Notes

- The setup uses development servers (React dev server, Laravel artisan serve)
- Database data persists in Docker volumes
- All services run in a custom network for isolation
- Hot reload enabled for both frontend and backend development

## 🤝 Contributing

When working with this Docker setup:

1. **Never commit** `.env` files with real credentials
2. **Test changes** in containers before pushing
3. **Update this README** if you modify the Docker setup
4. **Use the provided scripts** for consistency

## 💡 Tips

- Use `docker-compose logs -f servicename` to debug specific services
- Backend code changes are reflected immediately due to volume mounting
- Frontend uses hot reload for instant updates
- Use `make fresh` or the equivalent commands for a clean start
- Database data persists between container restarts

---

**Happy coding! 🎉**