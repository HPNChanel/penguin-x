from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.api.deps import get_db
from app.core.auth.permissions import get_current_active_user, get_current_active_superuser
from app.models.user import User
from app.services.user_service import get_user_service
from app.schemas.user import UserCreate, UserRead

router = APIRouter()


@router.get("/users", response_model=List[UserRead], tags=["User"])
async def get_users(
    current_user: User = Depends(get_current_active_superuser),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of users (admin only).
    
    Args:
        current_user: Current active superuser
        db: Database session
        
    Returns:
        List[UserRead]: List of users
    """
    # Get all users using the service function
    users = await get_user_service().get_all_users(db)
    return [UserRead.model_validate(user) for user in users]


@router.post("/users", response_model=UserRead, tags=["User"])
async def create_user(
    user_create: UserCreate,
    current_user: User = Depends(get_current_active_superuser),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new user (admin only).
    
    Args:
        user_create: User creation data
        current_user: Current active superuser
        db: Database session
        
    Returns:
        UserRead: Created user information
        
    Raises:
        HTTPException: If user creation fails
    """
    try:
        user = await get_user_service().create_user(db, user_create)
        return UserRead.model_validate(user)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User creation failed: {str(e)}"
        )


@router.get("/users/{user_id}", response_model=UserRead, tags=["User"])
async def get_user_by_id(
    user_id: UUID,
    current_user: User = Depends(get_current_active_superuser),
    db: AsyncSession = Depends(get_db)
):
    """
    Get user by UUID (admin only).
    
    Args:
        user_id: User UUID
        current_user: Current active superuser
        db: Database session
        
    Returns:
        UserRead: User information
        
    Raises:
        HTTPException: If user not found
    """
    user = await get_user_service().get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return UserRead.model_validate(user)


# User profile routes for authenticated users
@router.get("/profile", response_model=UserRead, tags=["User"])
async def get_my_profile(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user's profile.
    
    Args:
        current_user: Current active user
        
    Returns:
        UserRead: Current user's profile information
    """
    return UserRead.model_validate(current_user)


# Admin dashboard route
@router.get("/admin/dashboard", tags=["User", "Admin"])
async def admin_dashboard(
    current_user: User = Depends(get_current_active_superuser)
):
    """
    Admin dashboard (superuser only).
    
    Args:
        current_user: Current active superuser
        
    Returns:
        dict: Admin dashboard data
    """
    return {
        "message": "Admin Dashboard",
        "admin_user": current_user.email,
        "stats": {
            "total_users": "Coming soon",
            "active_users": "Coming soon"
        }
    }