"""
FastAPI authentication dependencies.

This module provides dependency functions for authenticating users in FastAPI endpoints,
including token extraction, validation, and user retrieval from database.
"""

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth.jwt import decode_access_token
from app.db.session import get_db
from app.models.user import User

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    scopes={
        "read": "Read access to user data",
        "write": "Write access to user data", 
        "admin": "Administrative access"
    }
)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token.
    
    This dependency extracts the JWT token from the Authorization header,
    decodes it, retrieves the user from the database, and validates the user's status.
    
    Args:
        token: JWT token from Authorization header (extracted by OAuth2PasswordBearer)
        db: Database session dependency
        
    Returns:
        User: Current authenticated user ORM instance
        
    Raises:
        HTTPException: 401 if token is invalid, expired, or user not found
        HTTPException: 400 if user is inactive
        
    Example:
        ```python
        @app.get("/profile")
        async def get_profile(current_user: User = Depends(get_current_user)):
            return {"email": current_user.email, "name": current_user.full_name}
        ```
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Decode JWT token
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    # Extract user identifier from token
    # Support both 'user_id' and 'sub' claims for flexibility
    user_id: Optional[str] = payload.get("user_id")
    if user_id is None:
        user_id = payload.get("sub")
    
    if user_id is None:
        raise credentials_exception
    
    # Get user from database using UUID string
    # Import user_service here to avoid circular imports
    from app.services.user_service import get_user_service
    user_service = get_user_service()
    
    try:
        # Use get_user_by_id which handles UUID conversion
        from uuid import UUID
        user_uuid = UUID(user_id)
        user = await user_service.get_user_by_id(db, user_id=user_uuid)
    except (ValueError, TypeError):
        # If user_id is not a valid UUID, try the old get_by_id method as fallback
        user = await user_service.get_by_email(db, email=user_id)
    
    if user is None:
        raise credentials_exception
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active user.
    
    This is a convenience dependency that ensures the user is active.
    It builds on get_current_user which already checks for active status.
    
    Args:
        current_user: Current user from get_current_user dependency
        
    Returns:
        User: Current active user
        
    Example:
        ```python
        @app.post("/sensitive-action")
        async def sensitive_action(user: User = Depends(get_current_active_user)):
            # This endpoint only accessible to active users
            pass
        ```
    """
    return current_user


async def get_current_superuser(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current superuser.
    
    This dependency ensures the current user has superuser privileges.
    
    Args:
        current_user: Current user from get_current_user dependency
        
    Returns:
        User: Current superuser
        
    Raises:
        HTTPException: 403 if user is not a superuser
        
    Example:
        ```python
        @app.delete("/admin/users/{user_id}")
        async def delete_user(
            user_id: str,
            admin: User = Depends(get_current_superuser)
        ):
            # Only superusers can delete users
            pass
        ```
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Superuser access required."
        )
    return current_user


async def get_optional_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """
    Get current user if token is provided and valid, otherwise return None.
    
    This dependency is useful for endpoints that work for both authenticated 
    and anonymous users, providing different functionality based on auth status.
    
    Args:
        token: Optional JWT token from Authorization header
        db: Database session dependency
        
    Returns:
        User or None: Current user if authenticated and valid, None otherwise
        
    Example:
        ```python
        @app.get("/content")
        async def get_content(user: Optional[User] = Depends(get_optional_current_user)):
            if user:
                # Return personalized content
                return {"content": "personalized", "user": user.email}
            else:
                # Return public content
                return {"content": "public"}
        ```
    """
    if not token:
        return None
    
    try:
        # Reuse the main authentication logic but catch exceptions
        # We need to call get_current_user with proper dependency injection
        # For this optional case, we'll duplicate the core logic to avoid dependency issues
        from app.services.user_service import get_user_service
        user_service = get_user_service()
        
        # Decode JWT token
        payload = decode_access_token(token)
        if payload is None:
            return None
        
        # Extract user identifier from token
        user_id: Optional[str] = payload.get("user_id")
        if user_id is None:
            user_id = payload.get("sub")
        
        if user_id is None:
            return None
        
        # Get user from database using UUID string
        try:
            from uuid import UUID
            user_uuid = UUID(user_id)
            user = await user_service.get_user_by_id(db, user_id=user_uuid)
        except (ValueError, TypeError):
            user = await user_service.get_by_email(db, email=user_id)
        
        if user is None or not user.is_active:
            return None
            
        return user
        
    except Exception:
        # If any error occurs, return None instead of raising exception
        return None