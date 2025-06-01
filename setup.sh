#!/bin/bash

echo "🚀 Setting up Employee Management System with Docker..."

# Create necessary directories
mkdir -p backend/storage/logs
mkdir -p backend/storage/framework/cache
mkdir -p backend/storage/framework/sessions
mkdir -p backend/storage/framework/views

# Set permissions (Linux/Mac)
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    chmod -R 775 backend/storage 2>/dev/null || true
    chmod -R 775 backend/bootstrap/cache 2>/dev/null || true
fi

# Copy environment files if they don't exist
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env file"
    echo "⚠️  Please update your backend/.env with proper database settings"
fi

# Update backend .env for Docker
echo "🔧 Updating backend .env for Docker..."
if [ -f backend/.env ]; then
    # Update database settings for Docker
    sed -i.bak 's/DB_HOST=127.0.0.1/DB_HOST=mysql/' backend/.env 2>/dev/null || \
    sed -i 's/DB_HOST=127.0.0.1/DB_HOST=mysql/' backend/.env 2>/dev/null || true
    
    sed -i.bak 's/DB_DATABASE=laravel/DB_DATABASE=employee_management/' backend/.env 2>/dev/null || \
    sed -i 's/DB_DATABASE=laravel/DB_DATABASE=employee_management/' backend/.env 2>/dev/null || true
    
    sed -i.bak 's/DB_USERNAME=root/DB_USERNAME=ems_user/' backend/.env 2>/dev/null || \
    sed -i 's/DB_USERNAME=root/DB_USERNAME=ems_user/' backend/.env 2>/dev/null || true
    
    sed -i.bak 's/DB_PASSWORD=/DB_PASSWORD=ems_pass/' backend/.env 2>/dev/null || \
    sed -i 's/DB_PASSWORD=/DB_PASSWORD=ems_pass/' backend/.env 2>/dev/null || true
fi

# Build and start containers
echo "🏗️  Building Docker containers..."
docker-compose down -v 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
sleep 30

# Run Laravel setup commands
echo "🔧 Setting up Laravel backend..."
docker-compose exec backend php artisan key:generate
docker-compose exec backend php artisan migrate --seed

echo "🎉 Setup complete!"
echo ""
echo "📋 Your application is running at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   Database: localhost:3307"
echo ""
echo "🔐 Default login credentials:"
echo "   Admin: admin@admin.com / admin123"
echo "   Manager: manager@company.com / manager123"
echo "   Employee: employee@company.com / employee123"
echo ""
echo "🛠️  Useful commands:"
echo "   Stop containers: docker-compose down"
echo "   View logs: docker-compose logs -f"
echo "   Restart: docker-compose restart"