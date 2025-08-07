from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.services.base import BaseService
from app.models.finance import Transaction, Budget
from app.schemas.finance import (
    TransactionCreate, TransactionRead, TransactionUpdate,
    BudgetCreate, BudgetRead
)


class TransactionService(BaseService[Transaction, TransactionCreate, TransactionUpdate]):
    """Service for transaction management operations."""
    
    def __init__(self):
        super().__init__(Transaction)
    
    async def get_by_id(self, db: AsyncSession, *, transaction_id: UUID) -> Optional[Transaction]:
        """Get transaction by UUID."""
        result = await db.execute(
            select(Transaction).where(Transaction.id == str(transaction_id))
        )
        return result.scalar_one_or_none()
    
    async def get_transactions_by_user(
        self, 
        db: AsyncSession, 
        *, 
        user_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Transaction]:
        """Get transactions for a specific user."""
        result = await db.execute(
            select(Transaction)
            .where(Transaction.user_id == str(user_id))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_transactions_by_category(
        self, 
        db: AsyncSession, 
        *, 
        category: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Transaction]:
        """Get transactions by category."""
        result = await db.execute(
            select(Transaction)
            .where(Transaction.category == category)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()


class BudgetService(BaseService[Budget, BudgetCreate, dict]):
    """Service for budget management operations."""
    
    def __init__(self):
        super().__init__(Budget)
    
    async def get_by_id(self, db: AsyncSession, *, budget_id: UUID) -> Optional[Budget]:
        """Get budget by UUID."""
        result = await db.execute(
            select(Budget).where(Budget.id == str(budget_id))
        )
        return result.scalar_one_or_none()
    
    async def get_budgets_by_user(
        self, 
        db: AsyncSession, 
        *, 
        user_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Budget]:
        """Get budgets for a specific user."""
        result = await db.execute(
            select(Budget)
            .where(Budget.user_id == str(user_id))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_budget_by_month_year(
        self, 
        db: AsyncSession, 
        *, 
        user_id: UUID,
        month: int,
        year: int
    ) -> Optional[Budget]:
        """Get budget for a specific month and year."""
        result = await db.execute(
            select(Budget)
            .where(
                (Budget.user_id == str(user_id)) & 
                (Budget.month == month) & 
                (Budget.year == year)
            )
        )
        return result.scalar_one_or_none()


# Create service instances
transaction_service = TransactionService()
budget_service = BudgetService()
