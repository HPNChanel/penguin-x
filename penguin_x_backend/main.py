from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.core.config import settings
from app.db.session import engine
from app.api.v1 import user, academy, finance, invest


def create_application() -> FastAPI:
    """Create and configure the FastAPI application."""
    
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description=settings.DESCRIPTION,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc",
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include API routers with modular domain routing
    app.include_router(user.router, prefix="/api/v1", tags=["User"])
    app.include_router(academy.router, prefix="/api/v1", tags=["Academy"])
    app.include_router(finance.router, prefix="/api/v1", tags=["Finance"])
    app.include_router(invest.router, prefix="/api/v1", tags=["Invest"])
    
    # Health check endpoint
    @app.get("/healthcheck")
    async def healthcheck():
        """Health check endpoint."""
        return {"status": "ok"}
    
    # Additional health endpoint with more details
    @app.get("/health")
    async def health_detail():
        """Detailed health check endpoint."""
        return {
            "status": "healthy",
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "environment": settings.ENVIRONMENT
        }
    
    # Root endpoint
    @app.get("/")
    async def root():
        """Root endpoint."""
        return {
            "message": f"Welcome to {settings.PROJECT_NAME}",
            "version": settings.VERSION,
            "docs": "/docs",
            "redoc": "/redoc",
            "health": "/health"
        }
    
    # Event handlers
    @app.on_event("startup")
    async def startup_event():
        """Initialize application on startup."""
        # Database initialization can be added here if needed
        pass
    
    @app.on_event("shutdown")
    async def shutdown_event():
        """Cleanup on application shutdown."""
        await engine.dispose()
    
    return app


# Create the application instance
app = create_application()


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info" if not settings.DEBUG else "debug",
    )