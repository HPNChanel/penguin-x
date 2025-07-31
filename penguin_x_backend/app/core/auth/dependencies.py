from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, SecurityScopes
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.auth.security import verify_token, TokenPayload
from app.models.user import User
from app.services.user_service import user_service


# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"/api/v1/auth/login",
    scopes={
        "read": "Read access",
        "write": "Write access",
        "admin": "Admin access"
    }
)


async def get_current_user(
    security_scopes: SecurityScopes,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token.
    
    Args:
        security_scopes: Required security scopes
        token: JWT token from Authorization header
        db: Database session
        
    Returns:
        User: Current authenticated user
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": authenticate_value},
    )
    
    # Verify token
    token_payload = verify_token(token)
    if token_payload is None:
        raise credentials_exception
    
    # Get user from database
    user = await user_service.get_by_id(db, user_id=token_payload.user_id)
    if user is None:
        raise credentials_exception
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Check scopes if specified
    if security_scopes.scopes:
        token_scopes = token_payload.scope.split() if token_payload.scope else []
        for scope in security_scopes.scopes:
            if scope not in token_scopes:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Not enough permissions",
                    headers={"WWW-Authenticate": authenticate_value},
                )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active user.
    
    Args:
        current_user: Current user from get_current_user dependency
        
    Returns:
        User: Current active user
        
    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    return current_user


async def get_current_superuser(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current superuser.
    
    Args:
        current_user: Current user from get_current_user dependency
        
    Returns:
        User: Current superuser
        
    Raises:
        HTTPException: If user is not a superuser
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


async def get_optional_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """
    Get current user if token is provided, otherwise return None.
    Useful for endpoints that work for both authenticated and anonymous users.
    
    Args:
        token: Optional JWT token
        db: Database session
        
    Returns:
        User or None: Current user if authenticated, None otherwise
    """
    if not token:
        return None
    
    try:
        token_payload = verify_token(token)
        if token_payload is None:
            return None
        
        user = await user_service.get_by_id(db, user_id=token_payload.user_id)
        if user and user.is_active:
            return user
        return None
        
    except Exception:
        return None


# Convenience dependencies for specific permission levels
async def require_read_permission(
    current_user: User = Depends(get_current_user)
) -> User:
    """Require read permission."""
    return current_user


async def require_write_permission(
    current_user: User = Depends(get_current_user)
) -> User:
    """Require write permission."""
    return current_user


async def require_admin_permission(
    current_user: User = Depends(get_current_superuser)
) -> User:
    """Require admin permission."""
    return current_user