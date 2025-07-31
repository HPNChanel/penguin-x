#!/usr/bin/env python3
"""
Development startup script for Penguin X Backend.
This script initializes the database and starts the FastAPI server.
"""

import asyncio
import sys
import logging
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from app.core.config import settings
from app.db.init_db import init_db, check_db_health

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def startup_check():
    """Perform startup checks and initialization."""
    try:
        logger.info("Starting Penguin X Backend...")
        logger.info(f"Environment: {settings.ENVIRONMENT}")
        logger.info(f"Debug mode: {settings.DEBUG}")
        
        # Check database health
        logger.info("Checking database connection...")
        db_health = await check_db_health()
        
        if db_health["status"] == "healthy":
            logger.info("✅ Database connection successful")
            logger.info(f"Users in database: {db_health.get('user_count', 'Unknown')}")
        else:
            logger.error("❌ Database connection failed")
            logger.error(f"Error: {db_health.get('error', 'Unknown error')}")
            return False
        
        # Initialize database if needed
        if settings.ENVIRONMENT == "development":
            logger.info("Initializing database for development...")
            await init_db()
            logger.info("✅ Database initialization complete")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Startup check failed: {e}")
        return False


def main():
    """Main entry point."""
    import uvicorn
    
    # Run startup checks
    startup_success = asyncio.run(startup_check())
    
    if not startup_success:
        logger.error("Startup checks failed. Exiting...")
        sys.exit(1)
    
    logger.info("🚀 Starting FastAPI server...")
    logger.info(f"Server will be available at: http://localhost:8000")
    logger.info(f"API documentation: http://localhost:8000/docs")
    logger.info(f"Health check: http://localhost:8000/healthcheck")
    
    # Start the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info" if not settings.DEBUG else "debug",
        access_log=settings.DEBUG,
    )


if __name__ == "__main__":
    main()