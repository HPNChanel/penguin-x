from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.domains.user.services.user_service import user_service
from app.domains.user.schemas.user import UserResponse, UserUpdate
from app.domains.user.api.auth import get_current_active_user, get_current_user
from app.schemas.base import PaginatedResponseSchema, PaginationSchema

router = APIRouter()


@router.get("/", response_model=PaginatedResponseSchema)
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """List all users (paginated)."""
    users = await user_service.get_multi(db, skip=skip, limit=limit)
    total = await user_service.count(db)
    
    pagination = PaginationSchema(
        page=(skip // limit) + 1,
        size=limit,
        total=total,
        pages=(total + limit - 1) // limit
    )
    
    return PaginatedResponseSchema(
        items=[UserResponse.model_validate(user) for user in users],
        pagination=pagination
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get a specific user by ID."""
    user = await user_service.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Update a user."""
    # Check if user exists
    user = await user_service.get(db, id=user_id)
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
    
    # Check if email/username already exists (if being updated)
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
    
    # Update user
    updated_user = await user_service.update(db, db_obj=user, obj_in=user_update)
    return updated_user


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Delete a user."""
    # Check if user exists
    user = await user_service.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check permissions (only superuser can delete users)
    if not await user_service.is_superuser(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Delete user
    await user_service.delete(db, id=user_id)
    
    return {"message": "User deleted successfully"}