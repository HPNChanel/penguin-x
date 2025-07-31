from typing import Optional
from pydantic import EmailStr, validator, Field

from app.schemas.base import (
    BaseCreateSchema, 
    BaseUpdateSchema, 
    BaseInDBSchema,
    BaseSchema
)


class UserBase(BaseSchema):
    """Base user schema with common fields."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    bio: Optional[str] = None


class UserCreate(UserBase, BaseCreateSchema):
    """Schema for creating a new user."""
    password: str = Field(..., min_length=8, max_length=100)
    
    @validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v


class UserRegister(BaseSchema):
    """Schema for user registration."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str = Field(..., min_length=8, max_length=100)
    
    @validator("confirm_password")
    def passwords_match(cls, v, values):
        if "password" in values and v != values["password"]:
            raise ValueError("Passwords do not match")
        return v


class UserLogin(BaseSchema):
    """Schema for user login."""
    username: str
    password: str


class UserUpdate(BaseUpdateSchema):
    """Schema for updating user information."""
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    bio: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None


class UserInDB(UserBase, BaseInDBSchema):
    """Schema for user data in database."""
    is_active: bool
    is_superuser: bool
    is_verified: bool


class UserResponse(UserBase, BaseInDBSchema):
    """Schema for user response (excludes sensitive data)."""
    is_active: bool
    is_verified: bool
    full_name: str

    class Config:
        from_attributes = True