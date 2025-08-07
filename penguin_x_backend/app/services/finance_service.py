from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.models.finance import Transaction, Budget
from app.schemas.finance import TransactionCreate, BudgetCreate


# Transaction service functions
async def get_all_transactions(db: AsyncSession) -> list[Transaction]:
    """Get all transactions from the database."""
    result = await db.execute(select(Transaction))
    return list(result.scalars().all())


async def get_transaction_by_id(db: AsyncSession, transaction_id: UUID) -> Transaction | None:
    """Get transaction by UUID."""
    result = await db.execute(select(Transaction).where(Transaction.id == str(transaction_id)))
    return result.scalar_one_or_none()


async def create_transaction(db: AsyncSession, transaction_data: TransactionCreate) -> Transaction:
    """Create a new transaction."""
    transaction_dict = transaction_data.model_dump()
    # Convert UUID to string for the user_id field
    if 'user_id' in transaction_dict:
        transaction_dict['user_id'] = str(transaction_dict['user_id'])
    
    db_transaction = Transaction(**transaction_dict)
    db.add(db_transaction)
    await db.commit()
    await db.flush()  # Ensure the transaction is written to DB
    await db.refresh(db_transaction)
    return db_transaction


# Budget service functions
async def get_all_budgets(db: AsyncSession) -> list[Budget]:
    """Get all budgets from the database."""
    result = await db.execute(select(Budget))
    return list(result.scalars().all())


async def get_budget_by_id(db: AsyncSession, budget_id: UUID) -> Budget | None:
    """Get budget by UUID."""
    result = await db.execute(select(Budget).where(Budget.id == str(budget_id)))
    return result.scalar_one_or_none()


async def create_budget(db: AsyncSession, budget_data: BudgetCreate) -> Budget:
    """Create a new budget."""
    budget_dict = budget_data.model_dump()
    # Convert UUID to string for the user_id field
    if 'user_id' in budget_dict:
        budget_dict['user_id'] = str(budget_dict['user_id'])
    
    db_budget = Budget(**budget_dict)
    db.add(db_budget)
    await db.commit()
    await db.flush()  # Ensure the budget is written to DB
    await db.refresh(db_budget)
    return db_budget
