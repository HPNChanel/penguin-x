from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


class Token(BaseModel):
    """Access token response schema."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    refresh_token: Optional[str] = None


class TokenData(BaseModel):
    """Token data for internal use."""
    username: Optional[str] = None
    user_id: Optional[str] = None  # Changed to string for UUID compatibility
    scopes: List[str] = []


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema."""
    refresh_token: str


class LoginRequest(BaseModel):
    """Login request schema."""
    username: str = Field(..., description="Username or email")
    password: str = Field(..., min_length=1)


class LoginResponse(BaseModel):
    """Login response schema."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    refresh_token: str
    user: dict  # Will be populated with user data


class LogoutRequest(BaseModel):
    """Logout request schema."""
    refresh_token: Optional[str] = None


class PasswordChangeRequest(BaseModel):
    """Password change request schema."""
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8)


class PasswordResetRequest(BaseModel):
    """Password reset request schema."""
    email: str = Field(..., description="Email address")


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation schema."""
    token: str = Field(..., description="Reset token")
    new_password: str = Field(..., min_length=8)


class TokenBlacklistEntry(BaseModel):
    """Token blacklist entry schema."""
    token_jti: str  # JWT ID
    user_id: str  # Changed to string for UUID compatibility
    expires_at: datetime
    created_at: datetime


class AuthErrorResponse(BaseModel):
    """Authentication error response schema."""
    detail: str
    error_code: Optional[str] = None


class PermissionScope(BaseModel):
    """Permission scope schema."""
    name: str
    description: str


class UserPermissions(BaseModel):
    """User permissions schema."""
    scopes: List[str]
    is_superuser: bool
    is_active: bool


class SecuritySettings(BaseModel):
    """Security settings schema."""
    password_min_length: int = 8
    password_require_uppercase: bool = True
    password_require_lowercase: bool = True
    password_require_numbers: bool = True
    password_require_special: bool = True
    session_timeout_minutes: int = 30
    max_login_attempts: int = 5
    lockout_duration_minutes: int = 15