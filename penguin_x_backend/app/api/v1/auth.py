"""
Authentication router for FastAPI application.

This module provides authentication endpoints including user registration,
login, and current user information retrieval.
"""

from datetime import timedelta
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr

# Database and dependencies
from app.db.session import get_db
from app.core.auth.dependencies import get_current_user

# Authentication functions
from app.core.auth.security import get_password_hash
from app.core.auth.jwt import create_access_token, create_refresh_token

# Schemas
from app.schemas.user import UserCreate, UserRead
from app.core.auth.schemas import LoginResponse, Token

# Services
from app.services.user_service import get_user_service

# Configuration
from app.core.config import settings

router = APIRouter()


class LoginRequest(BaseModel):
    """Login request schema."""
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema."""
    refresh_token: str


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> UserRead:
    """
    Register a new user.
    
    This endpoint accepts user registration data, hashes the password securely,
    and saves the user to the database.
    
    Args:
        user_in: User registration data including email, password, etc.
        db: Database session dependency
        
    Returns:
        UserRead: Created user information (without password)
        
    Raises:
        HTTPException: 400 if email already exists
        
    Example:
        ```json
        POST /auth/register
        {
            "email": "user@example.com",
            "password": "SecurePassword123!",
            "full_name": "John Doe"
        }
        ```
    """
    # Check if user already exists by email
    if await get_user_service().exists_by_email(db, email=user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
    
    # Create user with hashed password
    user = await get_user_service().create_user(db, user_data=user_in)
    
    # Return user data without password
    return UserRead.model_validate(user)


@router.post("/login", response_model=Dict[str, Any])
async def login(
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    User login endpoint.
    
    This endpoint accepts email and password, verifies the credentials,
    and returns an access token for authentication.
    
    Args:
        login_data: Login request containing email and password
        db: Database session dependency
        
    Returns:
        dict: Access token and user information
        
    Raises:
        HTTPException: 401 if credentials are invalid
        HTTPException: 400 if user account is inactive
        
    Example:
        ```json
        POST /auth/login
        {
            "email": "user@example.com",
            "password": "SecurePassword123!"
        }
        ```
        
        Response:
        ```json
        {
            "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
            "token_type": "bearer",
            "expires_in": 1800,
            "user": {
                "id": "uuid-string",
                "email": "user@example.com",
                "full_name": "John Doe"
            }
        }
        ```
    """
    # Authenticate user
    user = await get_user_service().authenticate(
        db, 
        username=login_data.email,  # Use email as username
        password=login_data.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user.email,
            "user_id": user.id,
            "role": user.role.value  # Include role in JWT payload
        },
        expires_delta=access_token_expires
    )
    
    # Create refresh token
    refresh_token = create_refresh_token(user_id=user.id)
    
    # Return token and user information
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert to seconds
        "refresh_token": refresh_token,
        "user": UserRead.model_validate(user).model_dump()
    }


@router.get("/me", response_model=UserRead)
async def get_current_user_info(
    current_user = Depends(get_current_user)
) -> UserRead:
    """
    Get current user information from JWT token.
    
    This endpoint extracts the JWT token from the Authorization header,
    validates it, and returns the current user's information.
    
    Args:
        current_user: Current authenticated user from JWT token
        
    Returns:
        UserRead: Current user information
        
    Raises:
        HTTPException: 401 if token is invalid or expired
        HTTPException: 400 if user account is inactive
        
    Example:
        ```
        GET /auth/me
        Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
        ```
        
        Response:
        ```json
        {
            "id": "uuid-string",
            "email": "user@example.com", 
            "full_name": "John Doe",
            "is_active": true,
            "is_superuser": false,
            "created_at": "2024-01-01T00:00:00Z"
        }
        ```
    """
    return UserRead.model_validate(current_user)


# Optional: Additional auth endpoints for completeness

@router.post("/refresh", response_model=Token)
async def refresh_access_token(
    refresh_data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
) -> Token:
    """
    Refresh access token using refresh token.
    
    Args:
        refresh_data: Refresh token request data
        db: Database session dependency
        
    Returns:
        Token: New access token
        
    Raises:
        HTTPException: 401 if refresh token is invalid
    """
    from app.core.auth.jwt import verify_refresh_token
    
    user_id = verify_refresh_token(refresh_data.refresh_token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user = await get_user_service().get_by_id(db, user_id=user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post("/logout")
async def logout() -> Dict[str, str]:
    """
    Logout endpoint.
    
    In a production implementation, this would typically:
    1. Blacklist the refresh token
    2. Optionally blacklist the access token
    3. Clear any server-side session data
    
    Returns:
        dict: Success message
    """
    return {"message": "Successfully logged out"}