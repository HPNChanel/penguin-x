"""
JWT token generation and verification utilities.

This module provides functions for creating and decoding JWT access tokens
using python-jose library with configurable expiration and secure algorithms.
"""

from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Union

from jose import JWTError, jwt

from app.core.config import settings


def create_access_token(
    data: dict, 
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create JWT access token with payload data.
    
    Args:
        data: Dictionary containing token payload data (typically user_id, sub, etc.)
        expires_delta: Custom expiration time. If None, uses default from settings
        
    Returns:
        str: Encoded JWT token
        
    Example:
        >>> token_data = {"sub": "user@example.com", "user_id": "uuid-string"}
        >>> token = create_access_token(token_data)
        >>> isinstance(token, str)
        True
    """
    # Create a copy to avoid modifying the original dict
    to_encode = data.copy()
    
    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    # Add standard JWT claims
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
    })
    
    # Encode and return JWT token
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.JWT_SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode and verify JWT access token.
    
    Args:
        token: JWT token string to decode
        
    Returns:
        dict: Token payload if valid, None if invalid or expired
        
    Example:
        >>> token = create_access_token({"user_id": "123", "sub": "user@example.com"})
        >>> payload = decode_access_token(token)
        >>> payload is not None
        True
        >>> payload.get("user_id")
        '123'
    """
    try:
        # Decode JWT token
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        
        # Check if token is expired (jose automatically validates exp claim)
        # Additional validation can be added here if needed
        
        return payload
        
    except JWTError:
        # Token is invalid, expired, or malformed
        return None


def create_refresh_token(user_id: str) -> str:
    """
    Create refresh token for user.
    
    Args:
        user_id: User UUID string
        
    Returns:
        str: Refresh token
        
    Example:
        >>> refresh_token = create_refresh_token("uuid-string")
        >>> isinstance(refresh_token, str)
        True
    """
    expire = datetime.utcnow() + timedelta(days=7)  # Refresh tokens last 7 days
    
    to_encode = {
        "exp": expire,
        "iat": datetime.utcnow(),
        "user_id": user_id,
        "type": "refresh"
    }
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def verify_refresh_token(token: str) -> Optional[str]:
    """
    Verify refresh token and return user ID.
    
    Args:
        token: Refresh token
        
    Returns:
        str: User UUID string if valid, None otherwise
        
    Example:
        >>> refresh_token = create_refresh_token("user-uuid")
        >>> user_id = verify_refresh_token(refresh_token)
        >>> user_id == "user-uuid"
        True
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        # Check if it's a refresh token
        if payload.get("type") != "refresh":
            return None
            
        user_id = payload.get("user_id")
        return user_id if user_id else None
        
    except JWTError:
        return None
