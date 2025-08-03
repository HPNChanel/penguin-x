import os
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection

from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Add the project root to the Python path
import sys
from pathlib import Path

project_root = Path(__file__).parents[3]  # Go up from app/db/migrations/ to project root
sys.path.insert(0, str(project_root))

# Import the metadata object and all models from our base module
from app.models.base import (
    Base, User, Course, Lesson, Enrollment, 
    Transaction, Budget, Investment, Watchlist
)  # noqa

target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def get_url():
    """Get database URL from environment variables."""
    # Try to get from environment first (for production/docker)
    url = os.getenv("DATABASE_URL")
    if url:
        return url
    
    # For Alembic, we need to use the sync version of the URL
    # Convert async URL to sync URL for Alembic
    try:
        from app.core.config import settings
        url = settings.DATABASE_URL
        if url.startswith("mysql+asyncmy://"):
            # Convert asyncmy to pymysql for Alembic
            url = url.replace("mysql+asyncmy://", "mysql+pymysql://")
        elif url.startswith("postgresql+asyncpg://"):
            # Convert asyncpg to psycopg2 for Alembic
            url = url.replace("postgresql+asyncpg://", "postgresql://")
        return url
    except Exception:
        # Fallback for initial setup
        return "mysql+pymysql://username:password@localhost:3306/penguin_x_db"


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,  # Compare column types
        compare_server_default=True,  # Compare server defaults
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection, 
        target_metadata=target_metadata,
        compare_type=True,  # Compare column types
        compare_server_default=True,  # Compare server defaults
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    from sqlalchemy import create_engine
    
    # Get the database URL and ensure it's sync for Alembic
    database_url = get_url()
    
    # Create sync engine for Alembic
    connectable = create_engine(
        database_url,
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        do_run_migrations(connection)

    connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()