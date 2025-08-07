from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.models.invest import Investment, Watchlist
from app.schemas.invest import InvestmentCreate, WatchlistCreate


# Investment service functions
async def get_all_investments(db: AsyncSession) -> list[Investment]:
    """Get all investments from the database."""
    result = await db.execute(select(Investment))
    return list(result.scalars().all())


async def get_investment_by_id(db: AsyncSession, investment_id: UUID) -> Investment | None:
    """Get investment by UUID."""
    result = await db.execute(select(Investment).where(Investment.id == str(investment_id)))
    return result.scalar_one_or_none()


async def create_investment(db: AsyncSession, investment_data: InvestmentCreate) -> Investment:
    """Create a new investment."""
    investment_dict = investment_data.model_dump()
    # Convert UUID to string for the user_id field
    if 'user_id' in investment_dict:
        investment_dict['user_id'] = str(investment_dict['user_id'])
    
    db_investment = Investment(**investment_dict)
    db.add(db_investment)
    await db.commit()
    await db.refresh(db_investment)
    return db_investment


# Watchlist service functions
async def get_all_watchlists(db: AsyncSession) -> list[Watchlist]:
    """Get all watchlist items from the database."""
    result = await db.execute(select(Watchlist))
    return list(result.scalars().all())


async def get_watchlist_by_id(db: AsyncSession, watchlist_id: UUID) -> Watchlist | None:
    """Get watchlist item by UUID."""
    result = await db.execute(select(Watchlist).where(Watchlist.id == str(watchlist_id)))
    return result.scalar_one_or_none()


async def create_watchlist(db: AsyncSession, watchlist_data: WatchlistCreate) -> Watchlist:
    """Create a new watchlist item."""
    watchlist_dict = watchlist_data.model_dump()
    # Convert UUID to string for the user_id field
    if 'user_id' in watchlist_dict:
        watchlist_dict['user_id'] = str(watchlist_dict['user_id'])
    
    db_watchlist = Watchlist(**watchlist_dict)
    db.add(db_watchlist)
    await db.commit()
    await db.refresh(db_watchlist)
    return db_watchlist
