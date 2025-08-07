"""
Password hashing and verification utilities using bcrypt.

This module provides secure password hashing and verification functions
using the bcrypt algorithm through passlib.
"""

from passlib.context import CryptContext

# Password hashing context with bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """
    Generate password hash using bcrypt.
    
    Args:
        password: Plain text password to hash
        
    Returns:
        str: Hashed password that can be safely stored in database
        
    Example:
        >>> hashed = get_password_hash("my_secret_password")
        >>> len(hashed) > 50  # bcrypt hashes are typically 60 characters
        True
    """
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        plain: Plain text password to verify
        hashed: Hashed password from database
        
    Returns:
        bool: True if password matches, False otherwise
        
    Example:
        >>> hashed = get_password_hash("secret")
        >>> verify_password("secret", hashed)
        True
        >>> verify_password("wrong", hashed)
        False
    """
    return pwd_context.verify(plain, hashed)