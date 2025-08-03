"""
Pydantic v2 schemas for investment models.

This module contains schemas for Investment and Watchlist models
with proper validation, enum support, and serialization.
"""

from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from uuid import UUID
from enum import Enum


class AssetTypeEnum(str, Enum):
    """Enum for asset types."""
    STOCK = "stock"
    BOND = "bond"
    CRYPTO = "crypto"
    FUND = "fund"


class InvestmentBase(BaseModel):
    """Base investment schema with common fields."""
    asset_name: str = Field(..., min_length=1, max_length=255, description="Name of the investment asset")
    asset_type: AssetTypeEnum = Field(..., description="Type of asset: stock, bond, crypto, or fund")
    amount_invested: float = Field(..., gt=0, description="Amount invested (must be positive)")
    purchase_date: datetime = Field(..., description="Date when the investment was purchased")
    current_value: float = Field(..., ge=0, description="Current value of the investment")
    notes: Optional[str] = Field(None, description="Additional notes about the investment")


class InvestmentCreate(InvestmentBase):
    """Schema for creating a new investment."""
    user_id: UUID = Field(..., description="UUID of user who owns this investment")


class InvestmentRead(InvestmentBase):
    """Schema for reading investment data (includes ID and user info)."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID


class WatchlistBase(BaseModel):
    """Base watchlist schema with common fields."""
    asset_symbol: str = Field(..., min_length=1, max_length=20, description="Symbol/ticker of the asset")
    asset_type: AssetTypeEnum = Field(..., description="Type of asset: stock, bond, crypto, or fund")


class WatchlistCreate(WatchlistBase):
    """Schema for creating a new watchlist entry."""
    user_id: UUID = Field(..., description="UUID of user who owns this watchlist entry")


class WatchlistRead(WatchlistBase):
    """Schema for reading watchlist data (includes ID, user info, and timestamp)."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    added_at: datetime