from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.user_service import user_service
from app.schemas.user import UserResponse, UserUpdate, UserList, UserPublic, UserStats
from app.core.auth.dependencies import (
    get_current_active_user, 
    get_current_superuser,
    get_optional_current_user
)
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=UserList)
async def list_users(
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of users to return"),
    search: Optional[str] = Query(None, description="Search users by username, email, or name"),
    active_only: bool = Query(False, description="Return only active users"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    List all users (paginated).
    
    Args:
        skip: Number of users to skip
        limit: Number of users to return
        search: Optional search query
        active_only: Filter for active users only
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        UserList: Paginated list of users
    """
    if search:
        users = await user_service.search_users(
            db, query=search, skip=skip, limit=limit
        )
        total = len(users)  # Simplified count for search results
    elif active_only:
        users = await user_service.get_active_users(
            db, skip=skip, limit=limit
        )
        total = await user_service.count_active_users(db)
    else:
        users = await user_service.get_multi(db, skip=skip, limit=limit)
        total = await user_service.count_users(db)
    
    return UserList(
        users=[UserResponse.model_validate(user) for user in users],
        total=total,
        page=(skip // limit) + 1,
        size=limit,
        pages=(total + limit - 1) // limit
    )


@router.get("/stats", response_model=UserStats)
async def get_user_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """
    Get user statistics (admin only).
    
    Args:
        db: Database session
        current_user: Current authenticated superuser
        
    Returns:
        UserStats: User statistics
    """
    total_users = await user_service.count_users(db)
    active_users = await user_service.count_active_users(db)
    verified_users = await user_service.count_verified_users(db)
    
    # TODO: Implement time-based counts (today, week, month)
    # For now, return zeros for these fields
    
    return UserStats(
        total_users=total_users,
        active_users=active_users,
        verified_users=verified_users,
        superusers=0,  # TODO: Implement
        users_registered_today=0,  # TODO: Implement
        users_registered_this_week=0,  # TODO: Implement
        users_registered_this_month=0,  # TODO: Implement
    )


@router.get("/public/{user_id}", response_model=UserPublic)
async def get_user_public(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Get public user information by ID.
    
    Args:
        user_id: User ID
        db: Database session
        current_user: Optional current user
        
    Returns:
        UserPublic: Public user information
        
    Raises:
        HTTPException: If user not found
    """
    user = await user_service.get_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Only return public info for active users
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserPublic.model_validate(user)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific user by ID.
    
    Args:
        user_id: User ID
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        UserResponse: User information
        
    Raises:
        HTTPException: If user not found or insufficient permissions
    """
    user = await user_service.get_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Users can only see their own full details unless they're superuser
    if not await user_service.is_superuser(current_user) and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return UserResponse.model_validate(user)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a user.
    
    Args:
        user_id: User ID to update
        user_update: User update data
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        UserResponse: Updated user information
        
    Raises:
        HTTPException: If user not found or insufficient permissions
    """
    # Check if user exists
    user = await user_service.get_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check permissions (users can only update themselves unless superuser)
    if not await user_service.is_superuser(current_user) and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Validate unique constraints
    update_data = user_update.model_dump(exclude_unset=True)
    
    if "email" in update_data:
        existing_user = await user_service.get_by_email(db, email=update_data["email"])
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    if "username" in update_data:
        existing_user = await user_service.get_by_username(db, username=update_data["username"])
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Non-superusers cannot modify certain fields
    if not await user_service.is_superuser(current_user):
        restricted_fields = {"is_active", "is_verified", "is_superuser"}
        for field in restricted_fields:
            if field in update_data:
                del update_data[field]
    
    # Update user
    updated_user = await user_service.update(db, db_obj=user, obj_in=update_data)
    return UserResponse.model_validate(updated_user)


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """
    Delete a user (superuser only).
    
    Args:
        user_id: User ID to delete
        db: Database session
        current_user: Current authenticated superuser
        
    Returns:
        dict: Success message
        
    Raises:
        HTTPException: If user not found
    """
    # Check if user exists
    user = await user_service.get_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent superuser from deleting themselves
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Delete user
    await user_service.delete(db, id=user_id)
    
    return {"message": "User deleted successfully"}


@router.post("/{user_id}/activate")
async def activate_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """
    Activate a user account (superuser only).
    
    Args:
        user_id: User ID to activate
        db: Database session
        current_user: Current authenticated superuser
        
    Returns:
        UserResponse: Updated user information
        
    Raises:
        HTTPException: If user not found
    """
    user = await user_service.get_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    updated_user = await user_service.activate_user(db, user=user)
    return UserResponse.model_validate(updated_user)


@router.post("/{user_id}/deactivate")
async def deactivate_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """
    Deactivate a user account (superuser only).
    
    Args:
        user_id: User ID to deactivate
        db: Database session
        current_user: Current authenticated superuser
        
    Returns:
        UserResponse: Updated user information
        
    Raises:
        HTTPException: If user not found
    """
    user = await user_service.get_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent superuser from deactivating themselves
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    updated_user = await user_service.deactivate_user(db, user=user)
    return UserResponse.model_validate(updated_user)


@router.post("/{user_id}/verify")
async def verify_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """
    Verify a user's email (superuser only).
    
    Args:
        user_id: User ID to verify
        db: Database session
        current_user: Current authenticated superuser
        
    Returns:
        UserResponse: Updated user information
        
    Raises:
        HTTPException: If user not found
    """
    user = await user_service.get_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    updated_user = await user_service.verify_user(db, user=user)
    return UserResponse.model_validate(updated_user)