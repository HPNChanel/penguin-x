"""
Role-based access control system.

This module defines the Role enum and provides utilities for role-based
permission checking throughout the application.
"""

from enum import Enum
from typing import List, Set


class Role(str, Enum):
    """
    User roles for role-based access control.
    
    Inherits from str to make it JSON serializable and easier to work with
    in FastAPI applications and database storage.
    """
    
    # Basic roles
    USER = "user"                    # Regular authenticated user
    ADMIN = "admin"                  # System administrator
    
    # Future role possibilities
    INSTRUCTOR = "instructor"        # Can create and manage courses
    STUDENT = "student"             # Can enroll in courses
    FINANCE_VIEWER = "finance_viewer"  # Can view financial data
    FINANCE_MANAGER = "finance_manager"  # Can manage financial data
    MODERATOR = "moderator"         # Can moderate content
    ANALYST = "analyst"             # Can view analytics and reports
    
    def __str__(self) -> str:
        return self.value


class RoleHierarchy:
    """
    Role hierarchy and permission management.
    
    Defines which roles inherit permissions from other roles
    and provides methods for checking role-based permissions.
    """
    
    # Role hierarchy - higher roles inherit permissions from lower roles
    HIERARCHY = {
        Role.USER: set(),  # Base role
        Role.STUDENT: {Role.USER},
        Role.INSTRUCTOR: {Role.USER, Role.STUDENT},
        Role.FINANCE_VIEWER: {Role.USER},
        Role.FINANCE_MANAGER: {Role.USER, Role.FINANCE_VIEWER},
        Role.MODERATOR: {Role.USER},
        Role.ANALYST: {Role.USER},
        Role.ADMIN: {  # Admin inherits from all roles
            Role.USER, Role.STUDENT, Role.INSTRUCTOR, 
            Role.FINANCE_VIEWER, Role.FINANCE_MANAGER,
            Role.MODERATOR, Role.ANALYST
        }
    }
    
    @classmethod
    def has_permission(cls, user_role: Role, required_role: Role) -> bool:
        """
        Check if a user role has permission for a required role.
        
        Args:
            user_role: The user's actual role
            required_role: The role required for the operation
            
        Returns:
            bool: True if the user has permission, False otherwise
            
        Example:
            >>> RoleHierarchy.has_permission(Role.ADMIN, Role.USER)
            True
            >>> RoleHierarchy.has_permission(Role.USER, Role.ADMIN)
            False
        """
        if user_role == required_role:
            return True
        
        # Check if user role inherits the required role
        return required_role in cls.get_inherited_roles(user_role)
    
    @classmethod
    def get_inherited_roles(cls, role: Role) -> Set[Role]:
        """
        Get all roles that the given role inherits from.
        
        Args:
            role: The role to check
            
        Returns:
            Set[Role]: Set of inherited roles
        """
        return cls.HIERARCHY.get(role, set())
    
    @classmethod
    def get_all_permissions(cls, role: Role) -> Set[Role]:
        """
        Get all permissions (including inherited) for a role.
        
        Args:
            role: The role to check
            
        Returns:
            Set[Role]: Set of all roles this role has permission for
        """
        permissions = {role}  # Include the role itself
        permissions.update(cls.get_inherited_roles(role))
        return permissions


# Convenience functions for common role checks
def is_admin(role: Role) -> bool:
    """Check if role is admin."""
    return role == Role.ADMIN


def is_instructor_or_higher(role: Role) -> bool:
    """Check if role is instructor or has instructor permissions."""
    return RoleHierarchy.has_permission(role, Role.INSTRUCTOR)


def is_finance_manager_or_higher(role: Role) -> bool:
    """Check if role is finance manager or has finance manager permissions."""
    return RoleHierarchy.has_permission(role, Role.FINANCE_MANAGER)


def can_view_finances(role: Role) -> bool:
    """Check if role can view financial data."""
    return RoleHierarchy.has_permission(role, Role.FINANCE_VIEWER)


def can_moderate(role: Role) -> bool:
    """Check if role can moderate content."""
    return RoleHierarchy.has_permission(role, Role.MODERATOR)


def can_view_analytics(role: Role) -> bool:
    """Check if role can view analytics."""
    return RoleHierarchy.has_permission(role, Role.ANALYST)
