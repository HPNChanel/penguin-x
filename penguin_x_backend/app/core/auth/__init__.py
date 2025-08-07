"""
Authentication module for FastAPI application.

This module provides complete authentication functionality including:
- Password hashing and verification (security.py)
- JWT token creation and validation (jwt.py) 
- FastAPI dependencies for authentication (dependencies.py)
"""

from .security import get_password_hash, verify_password
from .jwt import create_access_token, decode_access_token, create_refresh_token, verify_refresh_token
from .dependencies import (
    get_current_user,
    get_current_active_user,
    get_current_superuser,
    get_optional_current_user,
    oauth2_scheme
)

__all__ = [
    # Password utilities
    "get_password_hash",
    "verify_password",
    # JWT utilities
    "create_access_token", 
    "decode_access_token",
    "create_refresh_token",
    "verify_refresh_token",
    # FastAPI dependencies
    "get_current_user",
    "get_current_active_user", 
    "get_current_superuser",
    "get_optional_current_user",
    "oauth2_scheme",
]
