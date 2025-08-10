from sqlalchemy import Column, String, Boolean, DateTime, func, Enum as SQLEnum
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid import uuid4
from datetime import datetime
from typing import List, TYPE_CHECKING

from app.db.base_class import Base
from app.core.roles import Role

# Import for type checking to avoid circular imports
if TYPE_CHECKING:
    from app.models.academy import Course, Enrollment
    from app.models.finance import Transaction, Budget
    from app.models.invest import Investment, Watchlist


class User(Base):
    """
    User model for authentication and user management using UUID primary key.
    
    This model represents users in the system with authentication
    and profile information using SQLAlchemy 2.0+ async declarative style.
    """
    
    __tablename__ = "users"
    
    # UUID Primary Key
    id: Mapped[str] = mapped_column(
        CHAR(36),
        primary_key=True,
        default=lambda: str(uuid4()),
        doc="UUID primary key"
    )
    
    # Required fields
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
        doc="User's email address (unique)"
    )
    
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Hashed password using bcrypt"
    )
    
    # Optional fields with defaults
    full_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        doc="User's full name"
    )
    
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        doc="Whether the user account is active"
    )
    
    is_superuser: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        doc="Whether the user has superuser privileges (deprecated - use role instead)"
    )
    
    # Role-based access control
    role: Mapped[Role] = mapped_column(
        SQLEnum(Role),
        default=Role.USER,
        nullable=False,
        doc="User's role for role-based access control"
    )
    
    # Timestamp with auto-now
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        doc="Timestamp when the user was created"
    )
    
    # Note: Bidirectional relationships removed to prevent circular references
    # Use explicit queries in services when reverse relationships are needed
    
    def __repr__(self) -> str:
        return f"<User(id='{self.id}', email='{self.email}')>"