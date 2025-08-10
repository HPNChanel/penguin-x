"""
Finance models for transaction and budget management.

This module contains models for Transaction and Budget
using SQLAlchemy 2.0+ async declarative style with enums.
"""

from sqlalchemy import String, Text, DateTime, ForeignKey, Float, Integer, Enum as SQLEnum
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


class TransactionType(str, Enum):
    """Enum for transaction types."""
    INCOME = "income"
    EXPENSE = "expense"


class Transaction(Base):
    """
    Transaction model for finance system.
    
    Represents a financial transaction (income or expense) for a user.
    """
    
    __tablename__ = "transactions"
    
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
        doc="UUID of user who owns this transaction"
    )
    
    # Transaction type enum
    type: Mapped[TransactionType] = mapped_column(
        SQLEnum(TransactionType),
        nullable=False,
        doc="Type of transaction: income or expense"
    )
    
    # Required fields
    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        doc="Transaction category"
    )
    
    amount: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        doc="Transaction amount"
    )
    
    date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        doc="Date of the transaction"
    )
    
    # Optional fields
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        doc="Transaction description"
    )
    
    # Relationships - one-way to prevent circular references
    user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[user_id],
        lazy="noload",
        doc="User who owns this transaction"
    )
    
    def __repr__(self) -> str:
        return f"<Transaction(id='{self.id}', type='{self.type}', amount={self.amount})>"


class Budget(Base):
    """
    Budget model for finance system.
    
    Represents a monthly budget for a user with income and expense totals.
    """
    
    __tablename__ = "budgets"
    
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
        doc="UUID of user who owns this budget"
    )
    
    # Required fields
    month: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        doc="Budget month (1-12)"
    )
    
    year: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        doc="Budget year"
    )
    
    total_income: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
        doc="Total budgeted income for the month"
    )
    
    total_expense: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
        doc="Total budgeted expenses for the month"
    )
    
    # Optional fields
    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        doc="Budget notes"
    )
    
    # Relationships - one-way to prevent circular references
    user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[user_id],
        lazy="noload",
        doc="User who owns this budget"
    )
    
    def __repr__(self) -> str:
        return f"<Budget(id='{self.id}', user_id='{self.user_id}', {self.month}/{self.year})>"