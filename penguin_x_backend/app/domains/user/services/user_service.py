from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.services.base import BaseService
from app.domains.user.models.user import User
from app.domains.user.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


class UserService(BaseService[User, UserCreate, UserUpdate]):
    """Service for user management operations."""
    
    def __init__(self):
        super().__init__(User)
    
    async def create_user(
        self, 
        db: AsyncSession, 
        *, 
        user_in: UserCreate
    ) -> User:
        """Create a new user with hashed password."""
        hashed_password = get_password_hash(user_in.password)
        user_data = user_in.model_dump(exclude={"password"})
        user_data["hashed_password"] = hashed_password
        
        db_user = User(**user_data)
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
        """Get user by username."""
        result = await db.execute(
            select(User).where(User.username == username)
        )
        return result.scalar_one_or_none()
    
    async def authenticate(
        self,
        db: AsyncSession,
        *,
        username: str,
        password: str
    ) -> Optional[User]:
        """Authenticate user by username/email and password."""
        # Try to find user by username first, then by email
        user = await self.get_by_username(db, username=username)
        if not user:
            user = await self.get_by_email(db, email=username)
        
        if not user:
            return None
        
        if not verify_password(password, user.hashed_password):
            return None
        
        return user
    
    async def is_active(self, user: User) -> bool:
        """Check if user is active."""
        return user.is_active
    
    async def is_superuser(self, user: User) -> bool:
        """Check if user is superuser."""
        return user.is_superuser


# Create service instance
user_service = UserService()