from typing import List, Optional
from pydantic import validator
from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Penguin X Backend"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "FastAPI backend for Penguin X application"
    
    # Database Settings
    DATABASE_URL: str
    DATABASE_ECHO: bool = False
    
    # Security Settings
    SECRET_KEY: str
    JWT_SECRET_KEY: Optional[str] = None  # Will default to SECRET_KEY if not provided
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    @validator("JWT_SECRET_KEY", pre=True, always=True)
    def set_jwt_secret_key(cls, v, values):
        """Use SECRET_KEY if JWT_SECRET_KEY is not provided."""
        if v is None:
            return values.get("SECRET_KEY")
        return v
    
    # Environment Settings
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # CORS Settings
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1"]
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ]
    
    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()