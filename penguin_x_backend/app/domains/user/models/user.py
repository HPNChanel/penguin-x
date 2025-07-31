from sqlalchemy import Column, String, Boolean, Text
from sqlalchemy.orm import relationship

from app.db.base import BaseModel


class User(BaseModel):
    """User model for authentication and user management."""
    
    __tablename__ = "users"
    
    # Basic user information
    email = Column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
        doc="User's email address"
    )
    
    username = Column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
        doc="User's unique username"
    )
    
    first_name = Column(
        String(100),
        nullable=False,
        doc="User's first name"
    )
    
    last_name = Column(
        String(100),
        nullable=False,
        doc="User's last name"
    )
    
    # Authentication
    hashed_password = Column(
        String(255),
        nullable=False,
        doc="Hashed password"
    )
    
    # Status fields
    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
        doc="Whether the user account is active"
    )
    
    is_superuser = Column(
        Boolean,
        default=False,
        nullable=False,
        doc="Whether the user has superuser privileges"
    )
    
    is_verified = Column(
        Boolean,
        default=False,
        nullable=False,
        doc="Whether the user's email is verified"
    )
    
    # Additional fields
    bio = Column(
        Text,
        nullable=True,
        doc="User's biography"
    )
    
    phone = Column(
        String(20),
        nullable=True,
        doc="User's phone number"
    )
    
    @property
    def full_name(self) -> str:
        """Return the user's full name."""
        return f"{self.first_name} {self.last_name}"
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"