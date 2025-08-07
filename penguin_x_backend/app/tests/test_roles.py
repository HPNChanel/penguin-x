"""
Test cases for the role system and role hierarchy.

This module tests the Role enum and RoleHierarchy functionality.
"""

import pytest
from app.core.roles import (
    Role, 
    RoleHierarchy, 
    is_admin,
    is_instructor_or_higher,
    is_finance_manager_or_higher,
    can_view_finances,
    can_moderate,
    can_view_analytics
)


class TestRoleEnum:
    """Test Role enum functionality."""
    
    def test_role_values(self):
        """Test that role enum has expected values."""
        assert Role.USER == "user"
        assert Role.ADMIN == "admin"
        assert Role.INSTRUCTOR == "instructor"
        assert Role.STUDENT == "student"
        assert Role.FINANCE_VIEWER == "finance_viewer"
        assert Role.FINANCE_MANAGER == "finance_manager"
        assert Role.MODERATOR == "moderator"
        assert Role.ANALYST == "analyst"
    
    def test_role_string_conversion(self):
        """Test that roles can be converted to strings."""
        assert str(Role.USER) == "user"
        assert str(Role.ADMIN) == "admin"
    
    def test_role_json_serializable(self):
        """Test that roles are JSON serializable."""
        import json
        
        role_data = {"role": Role.ADMIN}
        json_str = json.dumps(role_data, default=str)
        assert "admin" in json_str


class TestRoleHierarchy:
    """Test role hierarchy and permission system."""
    
    def test_user_permissions(self):
        """Test basic USER role permissions."""
        assert RoleHierarchy.has_permission(Role.USER, Role.USER)
        assert not RoleHierarchy.has_permission(Role.USER, Role.ADMIN)
        assert not RoleHierarchy.has_permission(Role.USER, Role.INSTRUCTOR)
        assert not RoleHierarchy.has_permission(Role.USER, Role.FINANCE_MANAGER)
    
    def test_student_permissions(self):
        """Test STUDENT role permissions."""
        assert RoleHierarchy.has_permission(Role.STUDENT, Role.USER)
        assert RoleHierarchy.has_permission(Role.STUDENT, Role.STUDENT)
        assert not RoleHierarchy.has_permission(Role.STUDENT, Role.INSTRUCTOR)
        assert not RoleHierarchy.has_permission(Role.STUDENT, Role.ADMIN)
    
    def test_instructor_permissions(self):
        """Test INSTRUCTOR role permissions."""
        assert RoleHierarchy.has_permission(Role.INSTRUCTOR, Role.USER)
        assert RoleHierarchy.has_permission(Role.INSTRUCTOR, Role.STUDENT)
        assert RoleHierarchy.has_permission(Role.INSTRUCTOR, Role.INSTRUCTOR)
        assert not RoleHierarchy.has_permission(Role.INSTRUCTOR, Role.ADMIN)
        assert not RoleHierarchy.has_permission(Role.INSTRUCTOR, Role.FINANCE_MANAGER)
    
    def test_finance_viewer_permissions(self):
        """Test FINANCE_VIEWER role permissions."""
        assert RoleHierarchy.has_permission(Role.FINANCE_VIEWER, Role.USER)
        assert RoleHierarchy.has_permission(Role.FINANCE_VIEWER, Role.FINANCE_VIEWER)
        assert not RoleHierarchy.has_permission(Role.FINANCE_VIEWER, Role.FINANCE_MANAGER)
        assert not RoleHierarchy.has_permission(Role.FINANCE_VIEWER, Role.ADMIN)
    
    def test_finance_manager_permissions(self):
        """Test FINANCE_MANAGER role permissions."""
        assert RoleHierarchy.has_permission(Role.FINANCE_MANAGER, Role.USER)
        assert RoleHierarchy.has_permission(Role.FINANCE_MANAGER, Role.FINANCE_VIEWER)
        assert RoleHierarchy.has_permission(Role.FINANCE_MANAGER, Role.FINANCE_MANAGER)
        assert not RoleHierarchy.has_permission(Role.FINANCE_MANAGER, Role.ADMIN)
        assert not RoleHierarchy.has_permission(Role.FINANCE_MANAGER, Role.INSTRUCTOR)
    
    def test_moderator_permissions(self):
        """Test MODERATOR role permissions."""
        assert RoleHierarchy.has_permission(Role.MODERATOR, Role.USER)
        assert RoleHierarchy.has_permission(Role.MODERATOR, Role.MODERATOR)
        assert not RoleHierarchy.has_permission(Role.MODERATOR, Role.ADMIN)
        assert not RoleHierarchy.has_permission(Role.MODERATOR, Role.FINANCE_MANAGER)
    
    def test_analyst_permissions(self):
        """Test ANALYST role permissions."""
        assert RoleHierarchy.has_permission(Role.ANALYST, Role.USER)
        assert RoleHierarchy.has_permission(Role.ANALYST, Role.ANALYST)
        assert not RoleHierarchy.has_permission(Role.ANALYST, Role.ADMIN)
        assert not RoleHierarchy.has_permission(Role.ANALYST, Role.FINANCE_MANAGER)
    
    def test_admin_permissions(self):
        """Test ADMIN role has all permissions."""
        # Admin should have permission for all roles
        all_roles = [
            Role.USER, Role.STUDENT, Role.INSTRUCTOR,
            Role.FINANCE_VIEWER, Role.FINANCE_MANAGER,
            Role.MODERATOR, Role.ANALYST, Role.ADMIN
        ]
        
        for role in all_roles:
            assert RoleHierarchy.has_permission(Role.ADMIN, role), f"Admin should have {role} permission"
    
    def test_get_inherited_roles(self):
        """Test get_inherited_roles method."""
        # USER has no inherited roles
        assert RoleHierarchy.get_inherited_roles(Role.USER) == set()
        
        # STUDENT inherits from USER
        student_roles = RoleHierarchy.get_inherited_roles(Role.STUDENT)
        assert Role.USER in student_roles
        
        # INSTRUCTOR inherits from USER and STUDENT
        instructor_roles = RoleHierarchy.get_inherited_roles(Role.INSTRUCTOR)
        assert Role.USER in instructor_roles
        assert Role.STUDENT in instructor_roles
        
        # FINANCE_MANAGER inherits from USER and FINANCE_VIEWER
        finance_manager_roles = RoleHierarchy.get_inherited_roles(Role.FINANCE_MANAGER)
        assert Role.USER in finance_manager_roles
        assert Role.FINANCE_VIEWER in finance_manager_roles
        
        # ADMIN inherits from all roles
        admin_roles = RoleHierarchy.get_inherited_roles(Role.ADMIN)
        expected_admin_roles = {
            Role.USER, Role.STUDENT, Role.INSTRUCTOR,
            Role.FINANCE_VIEWER, Role.FINANCE_MANAGER,
            Role.MODERATOR, Role.ANALYST
        }
        assert admin_roles == expected_admin_roles
    
    def test_get_all_permissions(self):
        """Test get_all_permissions method."""
        # USER permissions (just itself)
        user_permissions = RoleHierarchy.get_all_permissions(Role.USER)
        assert user_permissions == {Role.USER}
        
        # STUDENT permissions (self + inherited)
        student_permissions = RoleHierarchy.get_all_permissions(Role.STUDENT)
        assert student_permissions == {Role.STUDENT, Role.USER}
        
        # INSTRUCTOR permissions (self + inherited)
        instructor_permissions = RoleHierarchy.get_all_permissions(Role.INSTRUCTOR)
        expected_instructor = {Role.INSTRUCTOR, Role.USER, Role.STUDENT}
        assert instructor_permissions == expected_instructor
        
        # ADMIN permissions (all roles)
        admin_permissions = RoleHierarchy.get_all_permissions(Role.ADMIN)
        all_roles = {
            Role.USER, Role.STUDENT, Role.INSTRUCTOR,
            Role.FINANCE_VIEWER, Role.FINANCE_MANAGER,
            Role.MODERATOR, Role.ANALYST, Role.ADMIN
        }
        assert admin_permissions == all_roles
    
    def test_role_equality(self):
        """Test that same roles have permission for themselves."""
        roles = [
            Role.USER, Role.STUDENT, Role.INSTRUCTOR,
            Role.FINANCE_VIEWER, Role.FINANCE_MANAGER,
            Role.MODERATOR, Role.ANALYST, Role.ADMIN
        ]
        
        for role in roles:
            assert RoleHierarchy.has_permission(role, role), f"{role} should have permission for itself"


class TestConvenienceFunctions:
    """Test convenience functions for common role checks."""
    
    def test_is_admin(self):
        """Test is_admin function."""
        assert is_admin(Role.ADMIN)
        assert not is_admin(Role.USER)
        assert not is_admin(Role.INSTRUCTOR)
        assert not is_admin(Role.FINANCE_MANAGER)
    
    def test_is_instructor_or_higher(self):
        """Test is_instructor_or_higher function."""
        assert is_instructor_or_higher(Role.INSTRUCTOR)
        assert is_instructor_or_higher(Role.ADMIN)  # Admin inherits instructor
        assert not is_instructor_or_higher(Role.USER)
        assert not is_instructor_or_higher(Role.STUDENT)
        assert not is_instructor_or_higher(Role.FINANCE_MANAGER)
    
    def test_is_finance_manager_or_higher(self):
        """Test is_finance_manager_or_higher function."""
        assert is_finance_manager_or_higher(Role.FINANCE_MANAGER)
        assert is_finance_manager_or_higher(Role.ADMIN)  # Admin inherits finance_manager
        assert not is_finance_manager_or_higher(Role.USER)
        assert not is_finance_manager_or_higher(Role.FINANCE_VIEWER)
        assert not is_finance_manager_or_higher(Role.INSTRUCTOR)
    
    def test_can_view_finances(self):
        """Test can_view_finances function."""
        assert can_view_finances(Role.FINANCE_VIEWER)
        assert can_view_finances(Role.FINANCE_MANAGER)  # Manager can view
        assert can_view_finances(Role.ADMIN)  # Admin can view
        assert not can_view_finances(Role.USER)
        assert not can_view_finances(Role.INSTRUCTOR)
    
    def test_can_moderate(self):
        """Test can_moderate function."""
        assert can_moderate(Role.MODERATOR)
        assert can_moderate(Role.ADMIN)  # Admin can moderate
        assert not can_moderate(Role.USER)
        assert not can_moderate(Role.INSTRUCTOR)
        assert not can_moderate(Role.FINANCE_MANAGER)
    
    def test_can_view_analytics(self):
        """Test can_view_analytics function."""
        assert can_view_analytics(Role.ANALYST)
        assert can_view_analytics(Role.ADMIN)  # Admin can view analytics
        assert not can_view_analytics(Role.USER)
        assert not can_view_analytics(Role.INSTRUCTOR)
        assert not can_view_analytics(Role.FINANCE_MANAGER)


class TestRoleHierarchyEdgeCases:
    """Test edge cases and error conditions."""
    
    def test_circular_dependency_prevention(self):
        """Test that there are no circular dependencies in role hierarchy."""
        # This test ensures our hierarchy doesn't have cycles
        visited = set()
        
        def check_no_cycles(role, path):
            if role in path:
                return False  # Cycle detected
            
            new_path = path | {role}
            inherited = RoleHierarchy.get_inherited_roles(role)
            
            for inherited_role in inherited:
                if not check_no_cycles(inherited_role, new_path):
                    return False
            
            return True
        
        # Check all roles for cycles
        for role in Role:
            assert check_no_cycles(role, set()), f"Circular dependency detected for {role}"
    
    def test_hierarchy_consistency(self):
        """Test that hierarchy is consistent and transitive."""
        # If A inherits from B, and B inherits from C, then A should inherit from C
        for role in Role:
            direct_inherited = RoleHierarchy.get_inherited_roles(role)
            all_permissions = RoleHierarchy.get_all_permissions(role)
            
            # All directly inherited roles should be in all permissions
            for inherited_role in direct_inherited:
                assert inherited_role in all_permissions
                
                # Transitivity: if role inherits from inherited_role,
                # and inherited_role inherits from X, then role should have permission for X
                inherited_permissions = RoleHierarchy.get_all_permissions(inherited_role)
                for transitive_role in inherited_permissions:
                    assert RoleHierarchy.has_permission(role, transitive_role), \
                        f"{role} should have transitive permission for {transitive_role} via {inherited_role}"
    
    def test_role_hierarchy_contains_all_roles(self):
        """Test that all roles are defined in the hierarchy."""
        for role in Role:
            # Each role should either have inherited roles or be in the hierarchy
            assert role in RoleHierarchy.HIERARCHY, f"Role {role} not found in hierarchy"
