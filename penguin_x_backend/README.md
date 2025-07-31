# Penguin X Backend

A modern FastAPI backend application built with a Modular Monolith architecture.

## Features

- **FastAPI** with async/await support
- **SQLAlchemy 2.0** with async engine
- **Pydantic v2** for data validation
- **MySQL** database with async support
- **JWT Authentication** with OAuth2
- **Alembic** for database migrations
- **Modular Monolith** architecture with domains
- **Comprehensive testing** setup

## Architecture

The project follows a Modular Monolith pattern with the following domains:
- `user` - User management and authentication
- `academy` - Educational content and courses
- `finance` - Financial transactions and management
- `invest` - Investment tracking and portfolio management

## Project Structure

```
penguin_x_backend/
├── app/
│   ├── core/                 # Core configuration and security
│   │   ├── auth/            # Authentication modules
│   │   │   ├── security.py  # Password hashing, JWT handling
│   │   │   ├── dependencies.py # Auth dependencies
│   │   │   └── schemas.py   # Auth schemas
│   │   └── config.py        # Settings management
│   ├── db/                  # Database configuration
│   │   ├── session.py       # Async database session
│   │   ├── base_class.py    # Base model classes
│   │   └── init_db.py       # Database initialization
│   ├── api/                 # API versioning
│   │   └── v1/              # Version 1 API
│   │       ├── auth.py      # Authentication endpoints
│   │       └── user.py      # User management endpoints
│   ├── models/              # Database models
│   │   └── user.py          # User model
│   ├── schemas/             # Pydantic schemas
│   │   └── user.py          # User schemas
│   ├── services/            # Business logic services
│   │   └── user_service.py  # User service
│   ├── utils/               # Utility functions
│   └── tests/               # Test suite
├── alembic/                 # Database migrations
├── requirements.txt         # Python dependencies
├── main.py                  # Application entry point
├── start.py                 # Development startup script
└── env_template.txt         # Environment variables template
```

## Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd penguin_x_backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Environment Configuration**
```bash
# Copy the environment template
cp env_template.txt .env

# Edit .env with your configuration
# Update DATABASE_URL with your MySQL credentials
# Set a secure SECRET_KEY
```

5. **Database Setup**
```bash
# Verify setup is correct
python verify_setup.py

# Initialize database with initial migration
python manage_db.py init

# Or use Alembic directly (after installing dependencies)
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

6. **Run the application**
```bash
# Development (recommended - includes startup checks)
python start.py

# Or run directly
python main.py

# Or with uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Environment Variables

Copy `env_template.txt` to `.env` and configure:

```bash
# Database
DATABASE_URL=mysql+asyncmy://username:password@localhost:3306/penguin_x_db
DATABASE_ECHO=False

# Security
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Environment
ENVIRONMENT=development
DEBUG=True

# CORS
ALLOWED_HOSTS=["localhost", "127.0.0.1"]
CORS_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]

# API
API_V1_STR=/api/v1
PROJECT_NAME=Penguin X Backend
VERSION=1.0.0
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/api/v1/openapi.json

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest app/tests/test_main.py
```

## Database Migrations

```bash
# Using the management script (recommended)
python manage_db.py create "Description of changes"  # Create migration
python manage_db.py upgrade                          # Apply migrations
python manage_db.py current                          # Show current revision
python manage_db.py history                          # Show migration history

# Using Alembic directly
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
alembic downgrade -1
alembic current
alembic history
```

For detailed migration documentation, see `MIGRATION_GUIDE.md`.

## Development

### Adding a New Domain

1. Create domain structure:
```bash
mkdir -p app/domains/new_domain/{models,schemas,services,api}
```

2. Implement models, schemas, services, and API routes
3. Add domain routes to `app/api/v1.py`
4. Create and run migrations

### Code Style

- Follow PEP 8
- Use type hints
- Write docstrings for all functions and classes
- Keep functions and classes focused and small

## Docker (Optional)

Create a `Dockerfile` for containerization:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.