"""
Pydantic v2 schemas for finance models.

This module contains schemas for Transaction and Budget models
with proper validation, enum support, and serialization.
"""

from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from uuid import UUID
from enum import Enum


class TransactionTypeEnum(str, Enum):
    """Enum for transaction types."""
    INCOME = "income"
    EXPENSE = "expense"


class TransactionBase(BaseModel):
    """Base transaction schema with common fields."""
    type: TransactionTypeEnum = Field(..., description="Transaction type: income or expense")
    category: str = Field(..., min_length=1, max_length=100, description="Transaction category")
    amount: float = Field(..., gt=0, description="Transaction amount (must be positive)")
    date: datetime = Field(..., description="Date of the transaction")
    description: Optional[str] = Field(None, description="Transaction description")


class TransactionCreate(TransactionBase):
    """Schema for creating a new transaction."""
    user_id: UUID = Field(..., description="UUID of user who owns this transaction")


class TransactionUpdate(BaseModel):
    """Schema for updating transaction information (all fields optional)."""
    type: Optional[TransactionTypeEnum] = Field(None, description="Transaction type")
    category: Optional[str] = Field(None, min_length=1, max_length=100, description="Transaction category")
    amount: Optional[float] = Field(None, gt=0, description="Transaction amount (must be positive)")
    date: Optional[datetime] = Field(None, description="Date of the transaction")
    description: Optional[str] = Field(None, description="Transaction description")


class TransactionRead(TransactionBase):
    """Schema for reading transaction data (includes ID and user info)."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID


class BudgetBase(BaseModel):
    """Base budget schema with common fields."""
    month: int = Field(..., ge=1, le=12, description="Budget month (1-12)")
    year: int = Field(..., ge=1900, le=3000, description="Budget year")
    total_income: float = Field(default=0.0, ge=0, description="Total budgeted income for the month")
    total_expense: float = Field(default=0.0, ge=0, description="Total budgeted expenses for the month")
    notes: Optional[str] = Field(None, description="Budget notes")


class BudgetCreate(BudgetBase):
    """Schema for creating a new budget."""
    user_id: UUID = Field(..., description="UUID of user who owns this budget")


class BudgetRead(BudgetBase):
    """Schema for reading budget data (includes ID and user info)."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID