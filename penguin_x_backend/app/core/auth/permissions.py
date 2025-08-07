"""
Permission dependency functions for role-based access control.

This module provides dependency functions for enforcing role-based access control
in FastAPI endpoints, including user activation checks and role validation.
"""

from fastapi import Depends, HTTPException, status

from app.core.auth.dependencies import get_current_user
from app.core.roles import Role, RoleHierarchy
from app.models.user import User


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active user dependency.
    
    This dependency ensures the current user is active. The get_current_user
    dependency already checks for active status, but this function provides
    an explicit active user check for clearer intent.
    
    Args:
        current_user: Current authenticated user from get_current_user dependency
        
    Returns:
        User: Current active user
        
    Raises:
        HTTPException: 400 if user is not active
        
    Example:
        ```python
        @app.get("/protected")
        async def protected_endpoint(
            current_user: User = Depends(get_current_active_user)
        ):
            return {"message": f"Hello {current_user.email}"}
        ```
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


async def get_current_active_superuser(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active admin/superuser dependency.
    
    This dependency ensures the current user is both active and has admin
    privileges. Used for admin-only endpoints.
    
    Args:
        current_user: Current authenticated user from get_current_user dependency
        
    Returns:
        User: Current active admin user
        
    Raises:
        HTTPException: 400 if user is not active
        HTTPException: 403 if user is not an admin
        
    Example:
        ```python
        @app.get("/admin/dashboard")
        async def admin_dashboard(
            current_user: User = Depends(get_current_active_superuser)
        ):
            return {"message": "Admin dashboard"}
        ```
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Check role-based permissions (with backward compatibility)
    if hasattr(current_user, 'role') and current_user.role:
        if not RoleHierarchy.has_permission(current_user.role, Role.ADMIN):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions. Admin access required."
            )
    else:
        # Fallback to is_superuser for backward compatibility
        if not current_user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions. Admin access required."
            )
    
    return current_user


# Role-specific permission functions
def require_role(required_role: Role):
    """
    Create a dependency function that requires a specific role.
    
    Args:
        required_role: The role required to access the endpoint
        
    Returns:
        Dependency function that checks for the required role
        
    Example:
        ```python
        require_instructor = require_role(Role.INSTRUCTOR)
        
        @app.post("/courses")
        async def create_course(
            current_user: User = Depends(require_instructor)
        ):
            return {"message": "Course created"}
        ```
    """
    async def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if not RoleHierarchy.has_permission(current_user.role, required_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. {required_role.value.title()} role required."
            )
        return current_user
    
    return role_checker


# Pre-defined role dependencies for common use cases
require_admin = require_role(Role.ADMIN)
require_instructor = require_role(Role.INSTRUCTOR)
require_finance_manager = require_role(Role.FINANCE_MANAGER)
require_finance_viewer = require_role(Role.FINANCE_VIEWER)
require_moderator = require_role(Role.MODERATOR)
require_analyst = require_role(Role.ANALYST)
