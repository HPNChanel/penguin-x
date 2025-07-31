from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool
import logging

from app.core.config import settings

# Configure logging for SQLAlchemy
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# Create async engine with connection pooling
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DATABASE_ECHO,
    future=True,
    pool_pre_ping=True,      # Verify connections before use
    pool_recycle=300,        # Recycle connections after 5 minutes
    pool_size=5,             # Number of connections to maintain
    max_overflow=10,         # Additional connections beyond pool_size
    # Use NullPool for testing to avoid connection issues
    poolclass=None if "sqlite" not in settings.DATABASE_URL else NullPool,
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency function to get database session.
    
    Yields:
        AsyncSession: Database session
        
    Example:
        @app.get("/users/")
        async def get_users(db: AsyncSession = Depends(get_db)):
            return await user_service.get_all(db)
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def create_tables():
    """
    Create all database tables.
    This should be used during application startup or in tests.
    """
    from app.models.base import Base
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def drop_tables():
    """
    Drop all database tables.
    This should only be used in tests or during development.
    """
    from app.models.base import Base
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def check_db_connection() -> bool:
    """
    Check if database connection is working.
    
    Returns:
        bool: True if connection is successful, False otherwise
    """
    try:
        async with AsyncSessionLocal() as session:
            await session.execute("SELECT 1")
            return True
    except Exception as e:
        logging.error(f"Database connection failed: {e}")
        return False


# Database health check for monitoring
async def get_db_info() -> dict:
    """
    Get database connection information for health checks.
    
    Returns:
        dict: Database information
    """
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute("SELECT VERSION() as version")
            version = result.scalar_one_or_none()
            
            return {
                "status": "connected",
                "database_url": settings.DATABASE_URL.split("@")[-1] if "@" in settings.DATABASE_URL else "local",
                "version": version,
                "pool_size": engine.pool.size(),
                "checked_out_connections": engine.pool.checkedout(),
            }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }