import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal, engine
from app.db.base_class import Base
from app.core.config import settings
from app.models.user import User
from app.services.user_service import user_service
from app.schemas.user import UserCreate

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def init_db() -> None:
    """
    Initialize database with tables and optional seed data.
    This function should be called during application startup.
    """
    try:
        logger.info("Creating database tables...")
        
        # Create all tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("Database tables created successfully")
        
        # Seed initial data if needed
        await seed_initial_data()
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise


async def seed_initial_data() -> None:
    """
    Seed the database with initial data.
    This includes creating default users, roles, etc.
    """
    async with AsyncSessionLocal() as db:
        try:
            # Check if we need to create initial admin user
            admin_user = await user_service.get_by_email(db, email="admin@penguinx.com")
            
            if not admin_user:
                logger.info("Creating initial admin user...")
                
                admin_data = UserCreate(
                    email="admin@penguinx.com",
                    username="admin",
                    first_name="Admin",
                    last_name="User",
                    password="admin123456",  # Change this in production!
                )
                
                admin_user = await user_service.create_user(db, user_in=admin_data)
                
                # Make the user a superuser
                admin_user.is_superuser = True
                admin_user.is_verified = True
                await db.commit()
                
                logger.info(f"Admin user created: {admin_user.email}")
            else:
                logger.info("Admin user already exists")
                
            # Check if we need to create test user in development
            if settings.ENVIRONMENT == "development":
                test_user = await user_service.get_by_email(db, email="test@penguinx.com")
                
                if not test_user:
                    logger.info("Creating test user for development...")
                    
                    test_data = UserCreate(
                        email="test@penguinx.com",
                        username="testuser",
                        first_name="Test",
                        last_name="User",
                        password="test123456",
                    )
                    
                    test_user = await user_service.create_user(db, user_in=test_data)
                    test_user.is_verified = True
                    await db.commit()
                    
                    logger.info(f"Test user created: {test_user.email}")
                    
        except Exception as e:
            logger.error(f"Error seeding initial data: {e}")
            await db.rollback()
            raise


async def reset_db() -> None:
    """
    Reset the database by dropping and recreating all tables.
    WARNING: This will delete all data! Only use in development/testing.
    """
    if settings.ENVIRONMENT == "production":
        raise ValueError("Cannot reset database in production environment")
    
    logger.warning("Resetting database - all data will be lost!")
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("Database reset completed")


async def check_db_health() -> dict:
    """
    Check database health and return status information.
    
    Returns:
        dict: Database health information
    """
    try:
        async with AsyncSessionLocal() as db:
            # Test basic connection
            await db.execute("SELECT 1")
            
            # Count users as a basic functionality test
            user_count = await user_service.count_users(db)
            
            return {
                "status": "healthy",
                "user_count": user_count,
                "database_url": settings.DATABASE_URL.split("@")[-1] if "@" in settings.DATABASE_URL else "local",
            }
            
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


async def migrate_data() -> None:
    """
    Perform data migrations if needed.
    This function can be used to migrate data between schema versions.
    """
    async with AsyncSessionLocal() as db:
        try:
            logger.info("Checking for data migrations...")
            
            # Example: Update existing users if needed
            # users_without_username = await db.execute(
            #     select(User).where(User.username.is_(None))
            # )
            # for user in users_without_username.scalars():
            #     user.username = user.email.split("@")[0]
            
            # await db.commit()
            
            logger.info("Data migrations completed")
            
        except Exception as e:
            logger.error(f"Error during data migration: {e}")
            await db.rollback()
            raise


if __name__ == "__main__":
    # This allows running the script directly for database initialization
    asyncio.run(init_db())