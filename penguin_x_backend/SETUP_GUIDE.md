# Penguin X Backend - Setup Guide

## Quick Start

1. **Navigate to project directory**
```bash
cd penguin_x_backend
```

2. **Create and activate virtual environment**
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment**
```bash
# Copy the template and edit
copy env_template.txt .env    # On Windows
cp env_template.txt .env      # On Linux/Mac

# Edit .env file with your settings:
# - DATABASE_URL: Your MySQL connection string
# - SECRET_KEY: A secure random string
# - Other configuration as needed
```

5. **Setup database**
```bash
# Create your MySQL database first
# Then run migrations
alembic upgrade head
```

6. **Run the application**
```bash
python main.py
# Or
python run.py
# Or
uvicorn main:app --reload
```

## What's Included

### ✅ Complete Project Structure
- Modular Monolith architecture with 4 domains
- Proper separation of concerns
- Clean directory structure

### ✅ Core Infrastructure
- FastAPI with async/await
- SQLAlchemy 2.0 with async engine
- Pydantic v2 schemas
- JWT authentication setup
- CORS and security middleware

### ✅ User Domain (Fully Implemented)
- User model with authentication fields
- Registration and login endpoints
- JWT token generation and validation
- User CRUD operations
- Role-based permissions

### ✅ Database Setup
- Alembic configuration for migrations
- Base model with timestamps
- Async database sessions
- MySQL async driver support

### ✅ Testing Setup
- Pytest configuration
- Test fixtures for database
- Example tests
- Async test client

### ✅ Development Tools
- Environment configuration
- Exception handling utilities
- Comprehensive README
- .gitignore file
- Startup scripts

## API Endpoints

Once running, visit http://localhost:8000/docs for interactive API documentation.

### Available Endpoints:
- `GET /` - Root endpoint
- `GET /health` - Health check
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/users/` - List users (paginated)
- `GET /api/v1/users/{id}` - Get user by ID
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user

## Next Steps

### 1. Implement Other Domains
The project includes placeholder structures for:
- `academy` - Educational content
- `finance` - Financial management
- `invest` - Investment tracking

### 2. Add Business Logic
Each domain should include:
- Models for database tables
- Schemas for API validation
- Services for business logic
- API routes for endpoints

### 3. Enhance Security
- Add email verification
- Implement password reset
- Add API rate limiting
- Set up proper logging

### 4. Add Features
- File upload handling
- Background tasks with Celery
- Caching with Redis
- API versioning
- Monitoring and metrics

## Environment Variables

Required variables in `.env`:

```bash
# Database (Required)
DATABASE_URL=mysql+asyncmy://user:password@localhost:3306/penguin_x_db

# Security (Required)
SECRET_KEY=your-super-secret-key-minimum-32-characters

# Optional
DEBUG=True
ENVIRONMENT=development
API_V1_STR=/api/v1
PROJECT_NAME=Penguin X Backend
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Troubleshooting

### Import Errors
- Make sure you're in the project root directory
- Ensure virtual environment is activated
- Check that all dependencies are installed

### Database Errors
- Verify MySQL is running
- Check database credentials in .env
- Ensure database exists
- Run `alembic upgrade head` to apply migrations

### Authentication Issues
- Verify SECRET_KEY is set in .env
- Check token format in Authorization header
- Ensure user exists and is active

## Production Deployment

For production:
1. Set `DEBUG=False` in environment
2. Use a production WSGI server (e.g., Gunicorn)
3. Set up proper database connection pooling
4. Configure logging
5. Set up monitoring and health checks
6. Use environment-specific configuration

The project is now ready for development!