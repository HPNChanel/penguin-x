from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
from uuid import UUID

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.auth.security import get_password_hash, verify_password
from app.services.base import BaseService


class UserService(BaseService[User, UserCreate, UserUpdate]):
    """Service for user management operations."""
    
    def __init__(self):
        super().__init__(User)
    
    # Requested functions using SQLAlchemy 2.0 async
    async def get_all_users(self, db: AsyncSession) -> list[User]:
        """Get all users from the database."""
        result = await db.execute(select(User))
        return list(result.scalars().all())
    
    async def get_user_by_id(self, db: AsyncSession, user_id: UUID) -> User | None:
        """Get user by UUID."""
        result = await db.execute(select(User).where(User.id == str(user_id)))
        return result.scalar_one_or_none()
    
    async def create_user(self, db: AsyncSession, user_data: UserCreate) -> User:
        """Create a new user with hashed password."""
        hashed_password = get_password_hash(user_data.password)
        user_dict = user_data.model_dump(exclude={"password"})
        user_dict["hashed_password"] = hashed_password
        
        db_user = User(**user_dict)
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user
    
    async def get_by_email(
        self, 
        db: AsyncSession, 
        *, 
        email: str
    ) -> Optional[User]:
        """Get user by email address."""
        result = await db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    async def get_by_username(
        self, 
        db: AsyncSession, 
        *, 
        username: str
    ) -> Optional[User]:
        """Get user by username (using email as username)."""
        # Since User model doesn't have username field, treat email as username
        result = await db.execute(
            select(User).where(User.email == username)
        )
        return result.scalar_one_or_none()
    
    async def get_by_id(
        self,
        db: AsyncSession,
        *,
        user_id: str
    ) -> Optional[User]:
        """Get user by UUID string."""
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def authenticate(
        self,
        db: AsyncSession,
        *,
        username: str,
        password: str
    ) -> Optional[User]:
        """
        Authenticate user by username/email and password.
        
        Args:
            db: Database session
            username: Username or email
            password: Plain text password
            
        Returns:
            User: Authenticated user or None if authentication fails
        """
        # Try to find user by username first, then by email
        user = await self.get_by_username(db, username=username)
        if not user:
            user = await self.get_by_email(db, email=username)
        
        if not user:
            return None
        
        if not verify_password(password, user.hashed_password):
            return None
        
        return user
    
    async def update_password(
        self,
        db: AsyncSession,
        *,
        user: User,
        new_password: str
    ) -> User:
        """
        Update user password.
        
        Args:
            db: Database session
            user: User instance
            new_password: New plain text password
            
        Returns:
            User: Updated user instance
        """
        hashed_password = get_password_hash(new_password)
        user.hashed_password = hashed_password
        await db.commit()
        await db.refresh(user)
        return user
    
    async def is_active(self, user: User) -> bool:
        """Check if user is active."""
        return user.is_active
    
    async def is_superuser(self, user: User) -> bool:
        """Check if user is superuser."""
        return user.is_superuser
    
    async def is_verified(self, user: User) -> bool:
        """Check if user email is verified (always True as model doesn't have this field)."""
        # User model doesn't have is_verified field, so return True
        return True
    
    async def deactivate_user(
        self,
        db: AsyncSession,
        *,
        user: User
    ) -> User:
        """Deactivate user account."""
        user.is_active = False
        await db.commit()
        await db.refresh(user)
        return user
    
    async def activate_user(
        self,
        db: AsyncSession,
        *,
        user: User
    ) -> User:
        """Activate user account."""
        user.is_active = True
        await db.commit()
        await db.refresh(user)
        return user
    
    async def search_users(
        self,
        db: AsyncSession,
        *,
        query: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[User]:
        """
        Search users by email or full name.
        
        Args:
            db: Database session
            query: Search query
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List[User]: List of matching users
        """
        search_term = f"%{query}%"
        result = await db.execute(
            select(User).where(
                or_(
                    User.email.ilike(search_term),
                    User.full_name.ilike(search_term)
                )
            ).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_active_users(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100
    ) -> List[User]:
        """Get only active users."""
        result = await db.execute(
            select(User).where(User.is_active == True)
            .offset(skip).limit(limit)
        )
        return result.scalars().all()
    
    async def count_users(self, db: AsyncSession) -> int:
        """Count total number of users."""
        result = await db.execute(select(func.count(User.id)))
        return result.scalar()
    
    async def count_active_users(self, db: AsyncSession) -> int:
        """Count number of active users."""
        result = await db.execute(
            select(func.count(User.id)).where(User.is_active == True)
        )
        return result.scalar()
    
    async def count_verified_users(self, db: AsyncSession) -> int:
        """Count number of verified users (same as total users since verification field doesn't exist)."""
        result = await db.execute(
            select(func.count(User.id))
        )
        return result.scalar()
    
    async def exists_by_email(self, db: AsyncSession, *, email: str) -> bool:
        """Check if user exists by email."""
        result = await db.execute(
            select(func.count(User.id)).where(User.email == email)
        )
        return result.scalar() > 0
    
    async def exists_by_username(self, db: AsyncSession, *, username: str) -> bool:
        """Check if user exists by username (using email)."""
        result = await db.execute(
            select(func.count(User.id)).where(User.email == username)
        )
        return result.scalar() > 0


# Create service instance
user_service = UserService()