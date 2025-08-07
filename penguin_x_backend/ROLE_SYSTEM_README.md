# Role-Based Access Control System

This document explains the expanded role-based permission system implemented in the Penguin X backend.

## Overview

The system has been upgraded from a simple `is_superuser` boolean flag to a comprehensive role-based access control (RBAC) system that supports multiple user roles with hierarchical permissions.

## Role Hierarchy

```
ADMIN
├── USER (base role)
├── STUDENT → USER
├── INSTRUCTOR → USER, STUDENT
├── FINANCE_VIEWER → USER
├── FINANCE_MANAGER → USER, FINANCE_VIEWER
├── MODERATOR → USER
└── ANALYST → USER
```

### Role Descriptions

- **USER**: Base role for all authenticated users
- **STUDENT**: Can enroll in courses and access learning materials
- **INSTRUCTOR**: Can create and manage courses, has student permissions
- **FINANCE_VIEWER**: Can view financial data and reports
- **FINANCE_MANAGER**: Can manage financial data, has finance viewer permissions
- **MODERATOR**: Can moderate content and manage community features
- **ANALYST**: Can view analytics and generate reports
- **ADMIN**: Has all permissions across the system

## Implementation

### 1. Role Enum (`app/core/roles.py`)

```python
from app.core.roles import Role

# Using roles
user_role = Role.INSTRUCTOR
is_admin = user_role == Role.ADMIN
```

### 2. User Model Updates

The `User` model now includes a `role` field:

```python
class User(Base):
    # ... other fields
    role: Mapped[Role] = mapped_column(
        SQLEnum(Role),
        default=Role.USER,
        nullable=False
    )
    # is_superuser is deprecated but kept for backward compatibility
```

### 3. JWT Token Updates

JWT tokens now include the user's role:

```python
{
    "sub": "user@example.com",
    "user_id": "uuid-string",
    "role": "instructor"  # New field
}
```

### 4. Permission Dependencies

#### Basic Permission Functions

```python
from app.core.auth.permissions import (
    get_current_active_user,
    get_current_active_superuser,
    require_role
)

# For any authenticated user
@app.get("/profile")
async def get_profile(current_user: User = Depends(get_current_active_user)):
    return {"email": current_user.email}

# For admin users (backward compatible)
@app.get("/admin/dashboard")
async def admin_dashboard(current_user: User = Depends(get_current_active_superuser)):
    return {"message": "Admin dashboard"}
```

#### Role-Specific Dependencies

```python
from app.core.auth.permissions import (
    require_admin,
    require_instructor,
    require_finance_manager
)

# Require specific role
@app.post("/courses")
async def create_course(current_user: User = Depends(require_instructor)):
    return {"message": "Course created"}

# Custom role requirement
require_finance_viewer = require_role(Role.FINANCE_VIEWER)

@app.get("/financial-reports")
async def get_reports(current_user: User = Depends(require_finance_viewer)):
    return {"reports": [...]}
```

## Usage Examples

### Protecting Routes by Role

```python
from fastapi import APIRouter, Depends
from app.core.auth.permissions import require_role, require_admin
from app.core.roles import Role

router = APIRouter()

# Only instructors and admins can create courses
@router.post("/courses")
async def create_course(
    course_data: CourseCreate,
    current_user: User = Depends(require_role(Role.INSTRUCTOR))
):
    # Instructors and admins can access this
    return await course_service.create(course_data, current_user)

# Only finance managers and admins can manage budgets
@router.post("/budgets")
async def create_budget(
    budget_data: BudgetCreate,
    current_user: User = Depends(require_role(Role.FINANCE_MANAGER))
):
    return await finance_service.create_budget(budget_data, current_user)

# Admin-only route
@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(require_admin)
):
    return await user_service.delete(user_id)
```

### Checking Permissions Programmatically

```python
from app.core.roles import RoleHierarchy, Role

# Check if user has permission for a specific role
def can_user_access_feature(user: User, required_role: Role) -> bool:
    return RoleHierarchy.has_permission(user.role, required_role)

# Usage
if can_user_access_feature(current_user, Role.FINANCE_VIEWER):
    # Show financial data
    pass
```

## Testing

### Running Tests

```bash
# Run all permission tests
python run_tests.py

# Or run specific test files
python -m pytest app/tests/test_roles.py -v
python -m pytest app/tests/test_permissions.py -v
```

### Test Coverage

The test suite covers:

1. **Role Hierarchy Tests** (`test_roles.py`):
   - Role enum functionality
   - Permission inheritance
   - Hierarchy consistency
   - Convenience functions

2. **Permission Tests** (`test_permissions.py`):
   - Permission dependency functions
   - HTTP endpoint protection
   - Token validation
   - Role-based access scenarios
   - Backward compatibility

### Example Test Scenarios

```python
# Test that regular user cannot access admin route
async def test_admin_route_as_regular_user_fails(client, db_session):
    user = await create_test_user(db_session, Role.USER)
    token = create_test_token(user)
    
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.get("/api/v1/users/admin/dashboard", headers=headers)
    assert response.status_code == 403

# Test that instructor can create courses
async def test_instructor_can_create_course(client, db_session):
    instructor = await create_test_user(db_session, Role.INSTRUCTOR)
    token = create_test_token(instructor)
    
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.post("/api/v1/academy/courses", 
                               json=course_data, headers=headers)
    assert response.status_code in [200, 201]
```

## Migration Guide

### For Existing Users

1. **Database Migration**: Add the `role` column to the users table
2. **Default Role**: Existing users get `Role.USER` by default
3. **Admin Users**: Users with `is_superuser=True` should be updated to `role=Role.ADMIN`

### Migration Script Example

```python
# Migration script
async def migrate_user_roles(db: AsyncSession):
    # Update existing superusers to admin role
    result = await db.execute(
        update(User)
        .where(User.is_superuser == True)
        .values(role=Role.ADMIN)
    )
    
    # Set default role for users without role
    result = await db.execute(
        update(User)
        .where(User.role.is_(None))
        .values(role=Role.USER)
    )
    
    await db.commit()
```

### Backward Compatibility

- The `is_superuser` field is maintained for backward compatibility
- Existing permission checks continue to work
- New role-based checks are additive, not breaking

## API Endpoints Protected by Role

### User Management
- `GET /api/v1/users` - Admin only
- `POST /api/v1/users` - Admin only
- `GET /api/v1/users/{id}` - Admin only
- `GET /api/v1/users/profile` - Authenticated users
- `GET /api/v1/users/admin/dashboard` - Admin only

### Academy
- `GET /api/v1/academy/courses` - Authenticated users
- `POST /api/v1/academy/courses` - Admin only (could be updated to Instructor+)
- `GET /api/v1/academy/admin/courses` - Admin only

### Finance
- `GET /api/v1/finance/transactions` - Authenticated users
- `POST /api/v1/finance/transactions` - Authenticated users
- `GET /api/v1/finance/summary` - Authenticated users
- `GET /api/v1/finance/admin/summary` - Admin only

### Investment
- `GET /api/v1/invest/investments` - Authenticated users
- `POST /api/v1/invest/investments` - Authenticated users
- `GET /api/v1/invest/admin/all-investments` - Admin only

## Future Enhancements

1. **Dynamic Role Assignment**: API endpoints for role management
2. **Permission Groups**: Group permissions for easier management
3. **Temporary Roles**: Time-limited role assignments
4. **Resource-Level Permissions**: Per-resource access control
5. **Audit Logging**: Track role changes and permission checks

## Best Practices

1. **Principle of Least Privilege**: Assign minimal required roles
2. **Role Inheritance**: Use hierarchy to avoid permission duplication
3. **Regular Review**: Periodically review user roles and permissions
4. **Testing**: Always test permission changes thoroughly
5. **Documentation**: Keep role descriptions and permissions documented
