from datetime import datetime, timedelta
from typing import Optional, Union, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from app.core.config import settings


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class TokenData(BaseModel):
    """Token data schema for JWT payload."""
    username: Optional[str] = None
    user_id: Optional[int] = None
    scopes: list[str] = []


class Token(BaseModel):
    """Token response schema."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenPayload(BaseModel):
    """JWT token payload schema."""
    sub: Optional[str] = None
    user_id: Optional[int] = None
    exp: Optional[datetime] = None
    iat: Optional[datetime] = None
    scope: str = ""


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        plain_password: The plain text password
        hashed_password: The hashed password from database
        
    Returns:
        bool: True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Generate password hash using bcrypt.
    
    Args:
        password: Plain text password
        
    Returns:
        str: Hashed password
    """
    return pwd_context.hash(password)


def create_access_token(
    subject: Union[str, Any],
    user_id: int,
    expires_delta: Optional[timedelta] = None,
    scopes: list[str] = None
) -> str:
    """
    Create JWT access token.
    
    Args:
        subject: Subject (usually username or email)
        user_id: User ID to include in token
        expires_delta: Custom expiration time
        scopes: List of permission scopes
        
    Returns:
        str: Encoded JWT token
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {
        "exp": expire,
        "iat": datetime.utcnow(),
        "sub": str(subject),
        "user_id": user_id,
        "scope": " ".join(scopes or [])
    }
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def verify_token(token: str) -> Optional[TokenPayload]:
    """
    Verify and decode JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        TokenPayload: Decoded token payload or None if invalid
    """
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        
        token_data = TokenPayload(**payload)
        
        # Check if token is expired
        if token_data.exp and datetime.utcnow() > token_data.exp:
            return None
            
        return token_data
        
    except JWTError:
        return None


def create_refresh_token(user_id: int) -> str:
    """
    Create refresh token for user.
    
    Args:
        user_id: User ID
        
    Returns:
        str: Refresh token
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
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def verify_refresh_token(token: str) -> Optional[int]:
    """
    Verify refresh token and return user ID.
    
    Args:
        token: Refresh token
        
    Returns:
        int: User ID if valid, None otherwise
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        # Check if it's a refresh token
        if payload.get("type") != "refresh":
            return None
            
        user_id = payload.get("user_id")
        return user_id if user_id else None
        
    except JWTError:
        return None