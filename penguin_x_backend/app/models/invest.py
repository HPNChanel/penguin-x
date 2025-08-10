"""
Investment models for portfolio and watchlist management.

This module contains models for Investment and Watchlist
using SQLAlchemy 2.0+ async declarative style with enums.
"""

from sqlalchemy import String, Text, DateTime, ForeignKey, Float, Enum as SQLEnum, func
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid import uuid4
from datetime import datetime
from typing import TYPE_CHECKING
from enum import Enum

from app.db.base_class import Base

# Import for type checking to avoid circular imports
if TYPE_CHECKING:
    from app.models.user import User


class AssetType(str, Enum):
    """Enum for asset types."""
    STOCK = "stock"
    BOND = "bond"
    CRYPTO = "crypto"
    FUND = "fund"


class Investment(Base):
    """
    Investment model for investment system.
    
    Represents an investment held by a user in their portfolio.
    """
    
    __tablename__ = "investments"
    
    # UUID Primary Key
    id: Mapped[str] = mapped_column(
        CHAR(36),
        primary_key=True,
        default=lambda: str(uuid4()),
        doc="UUID primary key"
    )
    
    # Foreign key to User
    user_id: Mapped[str] = mapped_column(
        CHAR(36),
        ForeignKey("users.id"),
        nullable=False,
        doc="UUID of user who owns this investment"
    )
    
    # Required fields
    asset_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Name of the asset"
    )
    
    # Asset type enum
    asset_type: Mapped[AssetType] = mapped_column(
        SQLEnum(AssetType),
        nullable=False,
        doc="Type of asset: stock, bond, crypto, or fund"
    )
    
    amount_invested: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        doc="Amount invested in this asset"
    )
    
    purchase_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        doc="Date when the investment was purchased"
    )
    
    current_value: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        doc="Current value of the investment"
    )
    
    # Optional fields
    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        doc="Additional notes about the investment"
    )
    
    # Relationships - one-way to prevent circular references
    user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[user_id],
        lazy="noload",
        doc="User who owns this investment"
    )
    
    def __repr__(self) -> str:
        return f"<Investment(id='{self.id}', asset_name='{self.asset_name}', type='{self.asset_type}')>"


class Watchlist(Base):
    """
    Watchlist model for investment system.
    
    Represents assets that a user is watching/monitoring.
    """
    
    __tablename__ = "watchlists"
    
    # UUID Primary Key
    id: Mapped[str] = mapped_column(
        CHAR(36),
        primary_key=True,
        default=lambda: str(uuid4()),
        doc="UUID primary key"
    )
    
    # Foreign key to User
    user_id: Mapped[str] = mapped_column(
        CHAR(36),
        ForeignKey("users.id"),
        nullable=False,
        doc="UUID of user who owns this watchlist item"
    )
    
    # Required fields
    asset_symbol: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        doc="Symbol/ticker of the asset"
    )
    
    # Asset type enum
    asset_type: Mapped[AssetType] = mapped_column(
        SQLEnum(AssetType),
        nullable=False,
        doc="Type of asset: stock, bond, crypto, or fund"
    )
    
    # Timestamp
    added_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        doc="Timestamp when the asset was added to watchlist"
    )
    
    # Relationships - one-way to prevent circular references
    user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[user_id],
        lazy="noload",
        doc="User who owns this watchlist item"
    )
    
    def __repr__(self) -> str:
        return f"<Watchlist(id='{self.id}', asset_symbol='{self.asset_symbol}', type='{self.asset_type}')>"