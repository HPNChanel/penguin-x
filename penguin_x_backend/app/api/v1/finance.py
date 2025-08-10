from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.api.deps import get_db
from app.core.auth.permissions import get_current_active_user, get_current_active_superuser
from app.models.user import User
from app.services import finance_service
from app.schemas.finance import (
    TransactionCreate, TransactionRead,
    BudgetCreate, BudgetRead
)

router = APIRouter()


# Transaction endpoints
@router.get("/transactions", response_model=List[TransactionRead], tags=["Finance"])
async def get_transactions(
    month: int = None,
    year: int = None,
    limit: int = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of user's transactions (authenticated users).
    
    Args:
        month: Optional month filter (1-12)
        year: Optional year filter
        limit: Optional limit on number of transactions to return
        current_user: Current active user
        db: Database session
        
    Returns:
        List[TransactionRead]: List of user's transactions
    """
    # For now, return empty list since we don't have user-specific transactions implemented yet
    # TODO: Implement user-specific transaction filtering by month/year/limit
    return []


@router.get("/summary", tags=["Finance"])
async def get_finance_summary(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get financial summary for authenticated user.
    
    Args:
        current_user: Current active user
        db: Database session
        
    Returns:
        dict: Financial summary data
    """
    return {
        "user": current_user.email,
        "total_transactions": "Coming soon",
        "total_budgets": "Coming soon",
        "balance": "Coming soon"
    }


@router.post("/transactions", response_model=TransactionRead, tags=["Finance"])
async def create_transaction(
    transaction_create: TransactionCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new transaction (authenticated users).
    
    Args:
        transaction_create: Transaction creation data
        current_user: Current active user
        db: Database session
        
    Returns:
        TransactionRead: Created transaction information
        
    Raises:
        HTTPException: If transaction creation fails
    """
    try:
        transaction = await finance_service.create_transaction(db, transaction_create)
        return TransactionRead.model_validate(transaction)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transaction creation failed: {str(e)}"
        )


@router.get("/transactions/{transaction_id}", response_model=TransactionRead, tags=["Finance"])
async def get_transaction_by_id(
    transaction_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get transaction by ID.
    
    Args:
        transaction_id: Transaction UUID
        db: Database session
        
    Returns:
        TransactionRead: Transaction information
        
    Raises:
        HTTPException: If transaction not found
    """
    transaction = await finance_service.get_transaction_by_id(db, transaction_id)
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    return TransactionRead.model_validate(transaction)


# Budget endpoints
@router.get("/budgets", response_model=List[BudgetRead], tags=["Finance"])
async def get_budgets(
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of all budgets.
    
    Args:
        db: Database session
        
    Returns:
        List[BudgetRead]: List of budgets
    """
    budgets = await finance_service.get_all_budgets(db)
    return [BudgetRead.model_validate(budget) for budget in budgets]


@router.post("/budgets", response_model=BudgetRead, tags=["Finance"])
async def create_budget(
    budget_create: BudgetCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new budget.
    
    Args:
        budget_create: Budget creation data
        db: Database session
        
    Returns:
        BudgetRead: Created budget information
        
    Raises:
        HTTPException: If budget creation fails
    """
    try:
        budget = await finance_service.create_budget(db, budget_create)
        return BudgetRead.model_validate(budget)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Budget creation failed: {str(e)}"
        )


@router.get("/budgets/{budget_id}", response_model=BudgetRead, tags=["Finance"])
async def get_budget_by_id(
    budget_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get budget by ID.
    
    Args:
        budget_id: Budget UUID
        db: Database session
        
    Returns:
        BudgetRead: Budget information
        
    Raises:
        HTTPException: If budget not found
    """
    budget = await finance_service.get_budget_by_id(db, budget_id)
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    return BudgetRead.model_validate(budget)


# Admin routes
@router.get("/admin/all-transactions", response_model=List[TransactionRead], tags=["Finance", "Admin"])
async def admin_get_all_transactions(
    current_user: User = Depends(get_current_active_superuser),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all transactions across all users (admin only).
    
    Args:
        current_user: Current active superuser
        db: Database session
        
    Returns:
        List[TransactionRead]: List of all transactions
    """
    transactions = await finance_service.get_all_transactions(db)
    return [TransactionRead.model_validate(transaction) for transaction in transactions]


@router.get("/admin/summary", tags=["Finance", "Admin"])
async def admin_finance_summary(
    current_user: User = Depends(get_current_active_superuser),
    db: AsyncSession = Depends(get_db)
):
    """
    Get financial summary for all users (admin only).
    
    Args:
        current_user: Current active superuser
        db: Database session
        
    Returns:
        dict: Global financial summary data
    """
    return {
        "admin_user": current_user.email,
        "total_transactions_all_users": "Coming soon",
        "total_budgets_all_users": "Coming soon",
        "system_balance": "Coming soon"
    }
