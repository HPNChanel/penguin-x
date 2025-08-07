from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.services.base import BaseService
from app.models.invest import Investment, Watchlist
from app.schemas.invest import (
    InvestmentCreate, InvestmentRead,
    WatchlistCreate, WatchlistRead
)


class InvestmentService(BaseService[Investment, InvestmentCreate, dict]):
    """Service for investment management operations."""
    
    def __init__(self):
        super().__init__(Investment)
    
    async def get_by_id(self, db: AsyncSession, *, investment_id: UUID) -> Optional[Investment]:
        """Get investment by UUID."""
        result = await db.execute(
            select(Investment).where(Investment.id == str(investment_id))
        )
        return result.scalar_one_or_none()
    
    async def get_investments_by_user(
        self, 
        db: AsyncSession, 
        *, 
        user_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Investment]:
        """Get investments for a specific user."""
        result = await db.execute(
            select(Investment)
            .where(Investment.user_id == str(user_id))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_investments_by_asset_type(
        self, 
        db: AsyncSession, 
        *, 
        asset_type: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Investment]:
        """Get investments by asset type."""
        result = await db.execute(
            select(Investment)
            .where(Investment.asset_type == asset_type)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_total_investment_value_by_user(
        self, 
        db: AsyncSession, 
        *, 
        user_id: UUID
    ) -> float:
        """Calculate total investment value for a user."""
        investments = await self.get_investments_by_user(db, user_id=user_id)
        return sum(investment.current_value for investment in investments)


class WatchlistService(BaseService[Watchlist, WatchlistCreate, dict]):
    """Service for watchlist management operations."""
    
    def __init__(self):
        super().__init__(Watchlist)
    
    async def get_by_id(self, db: AsyncSession, *, watchlist_id: UUID) -> Optional[Watchlist]:
        """Get watchlist item by UUID."""
        result = await db.execute(
            select(Watchlist).where(Watchlist.id == str(watchlist_id))
        )
        return result.scalar_one_or_none()
    
    async def get_watchlist_by_user(
        self, 
        db: AsyncSession, 
        *, 
        user_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Watchlist]:
        """Get watchlist items for a specific user."""
        result = await db.execute(
            select(Watchlist)
            .where(Watchlist.user_id == str(user_id))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_watchlist_by_symbol(
        self, 
        db: AsyncSession, 
        *, 
        asset_symbol: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Watchlist]:
        """Get watchlist items by asset symbol."""
        result = await db.execute(
            select(Watchlist)
            .where(Watchlist.asset_symbol == asset_symbol)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def is_asset_in_watchlist(
        self, 
        db: AsyncSession, 
        *, 
        user_id: UUID, 
        asset_symbol: str
    ) -> bool:
        """Check if an asset is in user's watchlist."""
        result = await db.execute(
            select(Watchlist)
            .where(
                (Watchlist.user_id == str(user_id)) & 
                (Watchlist.asset_symbol == asset_symbol)
            )
        )
        return result.scalar_one_or_none() is not None


# Create service instances
investment_service = InvestmentService()
watchlist_service = WatchlistService()
