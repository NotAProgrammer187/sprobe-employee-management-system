# Sprobe Employee Management System

A comprehensive full-stack employee management system built with Laravel and React, featuring employee performance reviews, user management, and administrative controls.

## 🚀 Features

- **Employee Management**: Complete CRUD operations for employee records
- **Performance Reviews**: Structured review system with templates and criteria
- **User Authentication**: Secure authentication using Laravel Sanctum
- **Role-based Access Control**: Admin and employee permissions
- **Dashboard Analytics**: Real-time statistics and insights
- **Review Templates**: Customizable review templates and criteria
- **Responsive Design**: Modern UI with Material-UI components
- **RESTful API**: Well-documented API endpoints

## 🛠️ Technology Stack

### Backend
- **[Laravel 10](https://laravel.com/)** - PHP framework for web artisans
- **[Laravel Sanctum](https://laravel.com/docs/sanctum)** - API authentication system
- **[MySQL](https://www.mysql.com/)** - Relational database management system
- **[PHP 8.1+](https://www.php.net/)** - Server-side scripting language

### Frontend
- **[React 19](https://reactjs.org/)** - JavaScript library for building user interfaces
- **[Material-UI (MUI)](https://mui.com/)** - React UI framework with pre-built components
- **[React Router DOM](https://reactrouter.com/)** - Declarative routing for React
- **[Axios](https://axios-http.com/)** - Promise-based HTTP client
- **[Date-fns](https://date-fns.org/)** - Modern JavaScript date utility library

## 🗄️ Database Schema (ERD)

![ERD Diagram](https://raw.githubusercontent.com/NotAProgrammer187/sprobe-employee-management-system/refs/heads/main/ERDiagram.png)

## 📋 Requirements

- **PHP**: ^8.1
- **Composer**: Latest version
- **Node.js**: ^18.0.0
- **npm**: ^9.0.0
- **MySQL**: ^8.0
- **Apache/Nginx**: Web server

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/sprobe-employee-management-system.git
cd sprobe-employee-management-system
```

### 2. Backend Setup

#### Install PHP Dependencies
```bash
cd backend
composer install
```

#### Environment Configuration
```bash
# Copy the environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

#### Configure Database
Edit the `.env` file with your database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

#### Run Database Migrations
```bash
php artisan migrate --seed
```

### 🔐 Default Users
After running the seeders, you can log in with these default accounts:

| Role | Email | Password | Access Level |
|------|-------|----------|-------------|
| **Admin** | `admin@admin.com` | `admin123` | Full system access |
| **Manager** | `manager@company.com` | `manager123` | Employee management |
| **Employee** | `employee@company.com` | `employee123` | Personal dashboard |

#### Start Laravel Development Server
```bash
php artisan serve
```
The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

#### Install Node Dependencies
```bash
cd ../frontend
npm install
```

#### Environment Configuration
Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

#### Start React Development Server
```bash
npm start
```
The frontend will be available at `http://localhost:3000`

## 📚 API Documentation

The API follows RESTful conventions and uses Laravel Sanctum for authentication.

### Authentication Endpoints

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| POST | `/api/register` | Register a new user | ❌ |
| POST | `/api/login` | User login | ❌ |
| GET | `/api/user` | Get authenticated user | ✅ |
| POST | `/api/logout` | User logout | ✅ |

### User Management Endpoints

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| GET | `/api/users` | Get all users | ✅ |
| POST | `/api/users` | Create new user | ✅ |
| GET | `/api/users/{id}` | Get specific user | ✅ |
| PUT | `/api/users/{id}` | Update user | ✅ |
| DELETE | `/api/users/{id}` | Delete user | ✅ |
| GET | `/api/dashboard/stats` | Get dashboard statistics | ✅ |

### Employee Management Endpoints

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| GET | `/api/employees` | Get all employees | ✅ |
| POST | `/api/employees` | Create new employee | ✅ |
| GET | `/api/employees/active` | Get active employees | ✅ |
| GET | `/api/employees/by-manager/{managerId}` | Get employees by manager | ✅ |
| GET | `/api/employees/{id}` | Get specific employee | ✅ |
| PUT | `/api/employees/{id}` | Update employee | ✅ |
| DELETE | `/api/employees/{id}` | Delete employee | ✅ |
| GET | `/api/employees/{id}/reviews` | Get employee reviews | ✅ |

### Review Management Endpoints

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| GET | `/api/reviews` | Get all reviews | ✅ |
| POST | `/api/reviews` | Create new review | ✅ |
| GET | `/api/reviews/upcoming` | Get upcoming reviews | ✅ |
| GET | `/api/reviews/completed` | Get completed reviews | ✅ |
| GET | `/api/reviews/by-reviewer/{reviewerId}` | Get reviews by reviewer | ✅ |
| GET | `/api/reviews/{id}` | Get specific review | ✅ |
| PUT | `/api/reviews/{id}` | Update review | ✅ |
| DELETE | `/api/reviews/{id}` | Delete review | ✅ |
| POST | `/api/reviews/{id}/submit` | Submit review | ✅ |
| POST | `/api/reviews/{id}/approve` | Approve review | ✅ |
| POST | `/api/reviews/{id}/reject` | Reject review | ✅ |

### Review Template Endpoints

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| GET | `/api/review-templates` | Get all templates | ✅ |
| POST | `/api/review-templates` | Create new template | ✅ |
| GET | `/api/review-templates/{id}` | Get specific template | ✅ |
| PUT | `/api/review-templates/{id}` | Update template | ✅ |
| DELETE | `/api/review-templates/{id}` | Delete template | ✅ |
| GET | `/api/review-templates/{id}/criteria` | Get template criteria | ✅ |
| POST | `/api/review-templates/{id}/criteria` | Add criteria to template | ✅ |
| PUT | `/api/review-templates/{templateId}/criteria/{criteriaId}` | Update criteria | ✅ |
| DELETE | `/api/review-templates/{templateId}/criteria/{criteriaId}` | Delete criteria | ✅ |

### Review Criteria Endpoints

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| GET | `/api/review-criteria/review/{reviewId}` | Get criteria by review | ✅ |

### Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer your_token_here
```

### Request/Response Examples

#### Login Request
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password"
  }'
```

#### Login Response
```json
{
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com"
  },
  "token": "your_access_token_here"
}
```

#### Get Employees Request
```bash
curl -X GET http://localhost:8000/api/employees \
  -H "Authorization: Bearer your_token_here"
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
php artisan test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📁 Project Structure

```
sprobe-employee-management-system/
├── backend/                    # Laravel backend
│   ├── app/                   # Application logic
│   │   ├── Http/Controllers/  # API controllers
│   │   ├── Models/           # Eloquent models
│   │   └── ...
│   ├── database/             # Migrations and seeders
│   ├── routes/               # Route definitions
│   │   └── api.php          # API routes
│   ├── .env.example         # Environment template
│   └── ...
├── frontend/                  # React frontend
│   ├── src/                  # Source code
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── ...
│   ├── public/              # Public assets
│   ├── package.json         # Node dependencies
│   └── .env                 # Environment variables
└── README.md               # This file
```

## 🔧 Development

### Backend Development
```bash
# Run migrations
php artisan migrate

# Create new migration
php artisan make:migration create_table_name

# Create new controller
php artisan make:controller ControllerName

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### Frontend Development
```bash
# Install new package
npm install package-name

# Build for production
npm run build

# Run linting
npm run lint
```