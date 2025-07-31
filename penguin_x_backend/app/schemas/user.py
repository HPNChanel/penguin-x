from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator, ConfigDict
from datetime import datetime


class BaseUser(BaseModel):
    """Base user schema with common fields."""
    model_config = ConfigDict(from_attributes=True)
    
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    timezone: str = Field(default="UTC", max_length=50)
    locale: str = Field(default="en-US", max_length=10)


class UserCreate(BaseModel):
    """Schema for creating a new user."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=8, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    bio: Optional[str] = None
    timezone: str = Field(default="UTC", max_length=50)
    locale: str = Field(default="en-US", max_length=10)
    
    @validator("password")
    def validate_password(cls, v):
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        
        # Check for at least one uppercase letter
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        
        # Check for at least one lowercase letter
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        
        # Check for at least one digit
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        
        return v
    
    @validator("username")
    def validate_username(cls, v):
        """Validate username format."""
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username can only contain letters, numbers, hyphens, and underscores")
        return v.lower()


class UserUpdate(BaseModel):
    """Schema for updating user information."""
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    timezone: Optional[str] = Field(None, max_length=50)
    locale: Optional[str] = Field(None, max_length=10)
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    
    @validator("username")
    def validate_username(cls, v):
        """Validate username format."""
        if v is not None and not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username can only contain letters, numbers, hyphens, and underscores")
        return v.lower() if v else v


class UserInDB(BaseUser):
    """Schema for user data in database (includes all fields)."""
    id: int
    is_active: bool
    is_superuser: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None
    failed_login_attempts: str = "0"
    locked_until: Optional[datetime] = None


class UserResponse(BaseUser):
    """Schema for user response (excludes sensitive data)."""
    id: int
    is_active: bool
    is_verified: bool
    full_name: str
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None


class UserPublic(BaseModel):
    """Public user information (minimal data for public display)."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    username: str
    first_name: str
    last_name: str
    full_name: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserRegister(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str = Field(..., min_length=8, max_length=100)
    terms_accepted: bool = Field(..., description="User must accept terms and conditions")
    
    @validator("confirm_password")
    def passwords_match(cls, v, values):
        """Validate that passwords match."""
        if "password" in values and v != values["password"]:
            raise ValueError("Passwords do not match")
        return v
    
    @validator("terms_accepted")
    def terms_must_be_accepted(cls, v):
        """Validate that terms are accepted."""
        if not v:
            raise ValueError("Terms and conditions must be accepted")
        return v
    
    @validator("password")
    def validate_password(cls, v):
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        
        return v


class UserLogin(BaseModel):
    """Schema for user login."""
    username: str = Field(..., description="Username or email")
    password: str = Field(..., min_length=1)
    remember_me: bool = Field(default=False, description="Keep user logged in longer")


class UserList(BaseModel):
    """Schema for paginated user list."""
    users: list[UserResponse]
    total: int
    page: int
    size: int
    pages: int


class UserStats(BaseModel):
    """User statistics schema."""
    total_users: int
    active_users: int
    verified_users: int
    superusers: int
    users_registered_today: int
    users_registered_this_week: int
    users_registered_this_month: int