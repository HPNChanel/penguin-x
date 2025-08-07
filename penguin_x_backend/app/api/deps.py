"""
Database dependency injection for FastAPI routes.

This module provides reusable database session dependencies for API endpoints.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency function to get database session for FastAPI routes.
    
    This function creates an async SQLAlchemy session that can be injected
    into API route handlers using FastAPI's dependency injection system.
    
    Yields:
        AsyncSession: Database session for performing database operations
        
    Example:
        @router.get("/users")
        async def get_users(db: AsyncSession = Depends(get_db)):
            return await user_service.get_all_users(db)
            
    Note:
        The session is automatically closed and rolled back on exceptions.
        Successful operations are committed when the context manager exits.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
