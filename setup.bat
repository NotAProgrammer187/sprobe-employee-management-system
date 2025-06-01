@echo off
echo 🚀 Setting up Employee Management System with Docker...

:: Create necessary directories
if not exist "backend\storage\logs" mkdir backend\storage\logs
if not exist "backend\storage\framework\cache" mkdir backend\storage\framework\cache
if not exist "backend\storage\framework\sessions" mkdir backend\storage\framework\sessions
if not exist "backend\storage\framework\views" mkdir backend\storage\framework\views

:: Copy environment files if they don't exist
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env"
    echo ✅ Created backend/.env file
    echo ⚠️  Please update your backend/.env with proper database settings
)

:: Update backend .env for Docker
echo 🔧 Updating backend .env for Docker...
if exist "backend\.env" (
    powershell -Command "(Get-Content 'backend\.env') -replace 'DB_HOST=127.0.0.1', 'DB_HOST=mysql' | Set-Content 'backend\.env'"
    powershell -Command "(Get-Content 'backend\.env') -replace 'DB_DATABASE=laravel', 'DB_DATABASE=employee_management' | Set-Content 'backend\.env'"
    powershell -Command "(Get-Content 'backend\.env') -replace 'DB_USERNAME=root', 'DB_USERNAME=ems_user' | Set-Content 'backend\.env'"
    powershell -Command "(Get-Content 'backend\.env') -replace 'DB_PASSWORD=', 'DB_PASSWORD=ems_pass' | Set-Content 'backend\.env'"
)

:: Build and start containers
echo 🏗️  Building Docker containers...
docker-compose up --build -d

:: Wait for MySQL to be ready
echo ⏳ Waiting for MySQL to be ready...
timeout /t 30 /nobreak >nul

:: Run Laravel setup commands
echo 🔧 Setting up Laravel backend...
docker-compose exec backend php artisan key:generate
docker-compose exec backend php artisan migrate --seed

echo 🎉 Setup complete!
echo.
echo 📋 Your application is running at:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:8000
echo    Database: localhost:3307
echo.
echo 🔐 Default login credentials:
echo    Admin: admin@admin.com / admin123
echo    Manager: manager@company.com / manager123
echo    Employee: employee@company.com / employee123
echo.
echo 🛠️  Useful commands:
echo    Stop containers: docker-compose down
echo    View logs: docker-compose logs -f
echo    Restart: docker-compose restart

pause