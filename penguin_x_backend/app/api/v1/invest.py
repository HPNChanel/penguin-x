from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.api.deps import get_db
from app.core.auth.permissions import get_current_active_user, get_current_active_superuser
from app.models.user import User
from app.services import invest_service
from app.schemas.invest import (
    InvestmentCreate, InvestmentRead,
    WatchlistCreate, WatchlistRead
)

router = APIRouter()


# Investment endpoints
@router.get("/investments", response_model=List[InvestmentRead], tags=["Invest"])
async def get_investments(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of user's investments (authenticated users).
    
    Args:
        current_user: Current active user
        db: Database session
        
    Returns:
        List[InvestmentRead]: List of user's investments
    """
    # For now, return empty list since we don't have user-specific investments implemented yet
    # TODO: Implement user-specific investment filtering
    return []


@router.post("/investments", response_model=InvestmentRead, tags=["Invest"])
async def create_investment(
    investment_create: InvestmentCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new investment (authenticated users).
    
    Args:
        investment_create: Investment creation data
        current_user: Current active user
        db: Database session
        
    Returns:
        InvestmentRead: Created investment information
        
    Raises:
        HTTPException: If investment creation fails
    """
    try:
        investment = await invest_service.create_investment(db, investment_create)
        return InvestmentRead.model_validate(investment)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Investment creation failed: {str(e)}"
        )


@router.get("/investments/{investment_id}", response_model=InvestmentRead, tags=["Invest"])
async def get_investment_by_id(
    investment_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get investment by ID.
    
    Args:
        investment_id: Investment UUID
        db: Database session
        
    Returns:
        InvestmentRead: Investment information
        
    Raises:
        HTTPException: If investment not found
    """
    investment = await invest_service.get_investment_by_id(db, investment_id)
    if not investment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )
    return InvestmentRead.model_validate(investment)


# Watchlist endpoints
@router.get("/watchlists", response_model=List[WatchlistRead], tags=["Invest"])
async def get_watchlists(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of user's watchlist items.
    
    Args:
        current_user: Current active user
        db: Database session
        
    Returns:
        List[WatchlistRead]: List of user's watchlist items
    """
    # For now, return empty list since we don't have user-specific watchlists implemented yet
    # TODO: Implement user-specific watchlist filtering
    return []


@router.post("/watchlists", response_model=WatchlistRead, tags=["Invest"])
async def create_watchlist(
    watchlist_create: WatchlistCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new watchlist item.
    
    Args:
        watchlist_create: Watchlist creation data
        db: Database session
        
    Returns:
        WatchlistRead: Created watchlist information
        
    Raises:
        HTTPException: If watchlist creation fails
    """
    try:
        watchlist = await invest_service.create_watchlist(db, watchlist_create)
        return WatchlistRead.model_validate(watchlist)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Watchlist creation failed: {str(e)}"
        )


@router.get("/watchlists/{watchlist_id}", response_model=WatchlistRead, tags=["Invest"])
async def get_watchlist_by_id(
    watchlist_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get watchlist item by ID.
    
    Args:
        watchlist_id: Watchlist UUID
        db: Database session
        
    Returns:
        WatchlistRead: Watchlist information
        
    Raises:
        HTTPException: If watchlist item not found
    """
    watchlist = await invest_service.get_watchlist_by_id(db, watchlist_id)
    if not watchlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist item not found"
        )
    return WatchlistRead.model_validate(watchlist)


# Admin routes
@router.get("/admin/all-investments", response_model=List[InvestmentRead], tags=["Invest", "Admin"])
async def admin_get_all_investments(
    current_user: User = Depends(get_current_active_superuser),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all investments across all users (admin only).
    
    Args:
        current_user: Current active superuser
        db: Database session
        
    Returns:
        List[InvestmentRead]: List of all investments
    """
    investments = await invest_service.get_all_investments(db)
    return [InvestmentRead.model_validate(investment) for investment in investments]


@router.get("/admin/portfolio-summary", tags=["Invest", "Admin"])
async def admin_portfolio_summary(
    current_user: User = Depends(get_current_active_superuser),
    db: AsyncSession = Depends(get_db)
):
    """
    Get investment portfolio summary for all users (admin only).
    
    Args:
        current_user: Current active superuser
        db: Database session
        
    Returns:
        dict: Global portfolio summary data
    """
    return {
        "admin_user": current_user.email,
        "total_investments_all_users": "Coming soon",
        "total_portfolio_value": "Coming soon",
        "most_popular_stocks": "Coming soon"
    }
