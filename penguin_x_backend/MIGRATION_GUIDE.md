# Database Migration Guide

This guide explains how to use Alembic for database migrations in the Penguin X Backend project.

## Configuration Overview

### Alembic Configuration
- **Configuration File**: `alembic.ini`
- **Migration Scripts**: `app/db/migrations/`
- **Environment Setup**: `app/db/migrations/env.py`
- **Metadata Source**: `app/models/base.py` (DeclarativeBase)

### Key Features
- ✅ Reads database URL from `.env` file
- ✅ Auto-generation support with `autogenerate=True`
- ✅ Proper async/sync handling for MySQL
- ✅ All models automatically discovered
- ✅ Type and server default comparison enabled

## Environment Setup

### 1. Install Dependencies
Make sure you have all required packages:
```bash
pip install -r requirements.txt
```

The key packages for migrations:
- `alembic==1.12.1` - Migration tool
- `pymysql==1.1.0` - Sync MySQL driver for Alembic
- `asyncmy==0.2.9` - Async MySQL driver for app

### 2. Configure Environment
Ensure your `.env` file has the database URL:
```bash
DATABASE_URL=mysql+asyncmy://username:password@localhost:3306/penguin_x_db
```

## Basic Migration Commands

### Using Alembic Directly

#### 1. Create a New Migration
```bash
# Auto-generate migration from model changes
alembic revision --autogenerate -m "Add user table"

# Create empty migration file
alembic revision -m "Custom migration"
```

#### 2. Apply Migrations
```bash
# Upgrade to latest
alembic upgrade head

# Upgrade to specific revision
alembic upgrade ae1027a6acf

# Upgrade one step
alembic upgrade +1
```

#### 3. View Migration Status
```bash
# Show current revision
alembic current

# Show migration history
alembic history

# Show verbose history
alembic history --verbose
```

#### 4. Downgrade Migrations
```bash
# Downgrade one step
alembic downgrade -1

# Downgrade to specific revision
alembic downgrade ae1027a6acf

# Downgrade to base (empty database)
alembic downgrade base
```

### Using the Management Script

We've provided a convenient `manage_db.py` script for common operations:

#### 1. Initialize Database
```bash
# Create initial migration and apply it
python manage_db.py init
```

#### 2. Create New Migration
```bash
# Auto-generate migration from model changes
python manage_db.py create "Add user profile fields"
```

#### 3. Apply Migrations
```bash
# Upgrade to latest
python manage_db.py upgrade

# Upgrade to specific revision
python manage_db.py upgrade ae1027a6acf
```

#### 4. View Status
```bash
# Show current revision
python manage_db.py current

# Show migration history
python manage_db.py history
```

#### 5. Reset Database
```bash
# Reset entire database (WARNING: destructive)
python manage_db.py reset
```

## Typical Workflow

### 1. Initial Setup
```bash
# 1. Configure your database connection in .env
# DATABASE_URL=mysql+asyncmy://user:pass@localhost:3306/dbname

# 2. Initialize the database
python manage_db.py init

# This creates the initial migration and applies it
```

### 2. Making Model Changes
```bash
# 1. Modify your models in app/models/
# 2. Generate migration
python manage_db.py create "Descriptive message about changes"

# 3. Review the generated migration file
# 4. Apply the migration
python manage_db.py upgrade
```

### 3. Production Deployment
```bash
# In production, only run upgrade
alembic upgrade head

# Or using the script
python manage_db.py upgrade
```

## Migration File Structure

Generated migration files are located in `app/db/migrations/versions/` and follow this structure:

```python
"""Add user table

Revision ID: ae1027a6acf
Revises: 
Create Date: 2024-01-15 10:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'ae1027a6acf'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Commands to upgrade the database
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        # ... more columns
        sa.PrimaryKeyConstraint('id')
    )

def downgrade() -> None:
    # Commands to downgrade the database
    op.drop_table('users')
```

## Advanced Usage

### 1. Manual Migration Editing

After generating a migration, you can edit it manually:

```bash
# Generate migration
alembic revision --autogenerate -m "Add user table"

# Edit the file in app/db/migrations/versions/
# Add custom SQL, data migrations, etc.

# Apply the migration
alembic upgrade head
```

### 2. Data Migrations

For complex data transformations:

```python
def upgrade() -> None:
    # Schema changes
    op.add_column('users', sa.Column('full_name', sa.String(200)))
    
    # Data migration
    connection = op.get_bind()
    connection.execute(
        "UPDATE users SET full_name = CONCAT(first_name, ' ', last_name)"
    )
    
    # Remove old columns
    op.drop_column('users', 'first_name')
    op.drop_column('users', 'last_name')
```

### 3. Multiple Database Support

If you need multiple databases, you can create separate Alembic configurations.

## Troubleshooting

### Common Issues

#### 1. "No module named 'app'"
```bash
# Make sure you're in the project root directory
cd penguin_x_backend
python manage_db.py create "Migration message"
```

#### 2. "Could not locate a database URL"
```bash
# Check your .env file has DATABASE_URL
# Or set environment variable:
export DATABASE_URL="mysql+asyncmy://user:pass@localhost:3306/dbname"
```

#### 3. "Target database is not up to date"
```bash
# Check current revision
alembic current

# Apply pending migrations
alembic upgrade head
```

#### 4. MySQL Connection Issues
```bash
# For Alembic, we use pymysql (sync driver)
# Make sure it's installed:
pip install pymysql

# Your DATABASE_URL should use asyncmy for the app:
# DATABASE_URL=mysql+asyncmy://user:pass@localhost:3306/dbname
```

### 5. Reverting Bad Migrations
```bash
# Downgrade to previous revision
alembic downgrade -1

# Or downgrade to specific revision
alembic downgrade ae1027a6acf

# Edit the problematic migration file
# Then upgrade again
alembic upgrade head
```

## Best Practices

### 1. Migration Messages
Use descriptive messages:
```bash
# Good
python manage_db.py create "Add user email verification fields"
python manage_db.py create "Create academy course model"

# Bad
python manage_db.py create "Update"
python manage_db.py create "Fix"
```

### 2. Review Generated Migrations
Always review auto-generated migrations before applying:
- Check for unintended changes
- Verify column types and constraints
- Add custom data migrations if needed

### 3. Backup Before Major Changes
```bash
# Backup your database before major migrations
mysqldump -u user -p penguin_x_db > backup.sql

# Then run migrations
python manage_db.py upgrade
```

### 4. Test Migrations
Test migrations in development environment first:
```bash
# Create test migration
python manage_db.py create "Test migration"

# Apply it
python manage_db.py upgrade

# If something goes wrong, rollback
python manage_db.py downgrade -1
```

## Integration with Application

The migration system integrates seamlessly with the FastAPI application:

- **Development**: Use `python start.py` which includes migration checks
- **Testing**: Test database is automatically set up with latest schema
- **Production**: Run migrations as part of deployment process

For more information, see the main README.md file.