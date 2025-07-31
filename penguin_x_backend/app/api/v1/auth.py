from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.auth.security import create_access_token, create_refresh_token, verify_refresh_token
from app.core.auth.schemas import Token, LoginResponse, RefreshTokenRequest
from app.core.auth.dependencies import get_current_active_user
from app.schemas.user import UserRegister, UserResponse, UserCreate
from app.services.user_service import user_service
from app.core.config import settings

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserRegister,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user.
    
    Args:
        user_in: User registration data
        db: Database session
        
    Returns:
        UserResponse: Created user information
        
    Raises:
        HTTPException: If email or username already exists
    """
    # Check if user already exists
    if await user_service.exists_by_email(db, email=user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    if await user_service.exists_by_username(db, username=user_in.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create user
    user_create_data = user_in.model_dump(exclude={"confirm_password", "terms_accepted"})
    user_create = UserCreate(**user_create_data)
    
    user = await user_service.create_user(db, user_in=user_create)
    return UserResponse.model_validate(user)


@router.post("/login", response_model=LoginResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """
    User login endpoint.
    
    Args:
        form_data: OAuth2 form data with username and password
        db: Database session
        
    Returns:
        LoginResponse: Access token and user information
        
    Raises:
        HTTPException: If credentials are invalid or user is inactive
    """
    user = await user_service.authenticate(
        db, 
        username=form_data.username, 
        password=form_data.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not await user_service.is_active(user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.username,
        user_id=user.id,
        expires_delta=access_token_expires
    )
    
    refresh_token = create_refresh_token(user_id=user.id)
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert to seconds
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user).model_dump()
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using refresh token.
    
    Args:
        refresh_data: Refresh token request
        db: Database session
        
    Returns:
        Token: New access token
        
    Raises:
        HTTPException: If refresh token is invalid
    """
    user_id = verify_refresh_token(refresh_data.refresh_token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user = await user_service.get_by_id(db, user_id=user_id)
    if not user or not await user_service.is_active(user):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.username,
        user_id=user.id,
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user = Depends(get_current_active_user)
):
    """
    Get current user information.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        UserResponse: Current user information
    """
    return UserResponse.model_validate(current_user)


@router.post("/logout")
async def logout():
    """
    Logout endpoint (placeholder).
    
    In a real implementation, this would:
    1. Blacklist the refresh token
    2. Optionally blacklist the access token
    3. Clear any server-side session data
    
    Returns:
        dict: Success message
    """
    # TODO: Implement token blacklisting
    return {"message": "Successfully logged out"}


@router.post("/verify-email")
async def verify_email():
    """
    Email verification endpoint (placeholder).
    
    This would typically:
    1. Accept a verification token
    2. Verify the token and mark user as verified
    3. Return success/failure response
    
    Returns:
        dict: Placeholder response
    """
    # TODO: Implement email verification
    return {"message": "Email verification endpoint - to be implemented"}


@router.post("/forgot-password")
async def forgot_password():
    """
    Forgot password endpoint (placeholder).
    
    This would typically:
    1. Accept an email address
    2. Generate a password reset token
    3. Send reset email to user
    
    Returns:
        dict: Placeholder response
    """
    # TODO: Implement password reset
    return {"message": "Password reset endpoint - to be implemented"}


@router.post("/reset-password")
async def reset_password():
    """
    Reset password endpoint (placeholder).
    
    This would typically:
    1. Accept a reset token and new password
    2. Verify the token
    3. Update user's password
    
    Returns:
        dict: Placeholder response
    """
    # TODO: Implement password reset confirmation
    return {"message": "Password reset confirmation endpoint - to be implemented"}