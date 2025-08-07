"""
Example migration script to add role column to existing User table.

This script shows how to add the role column and migrate existing users.
Run this AFTER creating the Alembic migration for the schema change.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update, select
from app.db.session import get_db
from app.models.user import User
from app.core.roles import Role


async def migrate_user_roles():
    """
    Migrate existing users to the new role system.
    
    This function:
    1. Sets all superusers to ADMIN role
    2. Sets all other users to USER role
    """
    print("🔄 Starting user role migration...")
    
    # Get database session
    async for db in get_db():
        try:
            # Get all users
            result = await db.execute(select(User))
            users = result.scalars().all()
            
            admin_count = 0
            user_count = 0
            
            for user in users:
                if user.is_superuser:
                    # Set superusers to admin role
                    user.role = Role.ADMIN
                    admin_count += 1
                    print(f"  👑 Setting {user.email} to ADMIN role")
                else:
                    # Set regular users to user role
                    user.role = Role.USER
                    user_count += 1
                    print(f"  👤 Setting {user.email} to USER role")
            
            # Commit changes
            await db.commit()
            
            print(f"\n✅ Migration completed!")
            print(f"   - {admin_count} users set to ADMIN role")
            print(f"   - {user_count} users set to USER role")
            
        except Exception as e:
            await db.rollback()
            print(f"❌ Migration failed: {e}")
            raise
        finally:
            await db.close()
            break


async def create_sample_role_users():
    """
    Create sample users with different roles for testing.
    
    This is useful for development and testing the role system.
    """
    print("🔄 Creating sample users with different roles...")
    
    from app.services.user_service import user_service
    from app.schemas.user import UserCreate
    
    sample_users = [
        {
            "email": "admin@penguin.com", 
            "password": "AdminPass123!", 
            "full_name": "System Admin",
            "role": Role.ADMIN
        },
        {
            "email": "instructor@penguin.com", 
            "password": "InstructorPass123!", 
            "full_name": "John Instructor",
            "role": Role.INSTRUCTOR
        },
        {
            "email": "student@penguin.com", 
            "password": "StudentPass123!", 
            "full_name": "Jane Student",
            "role": Role.STUDENT
        },
        {
            "email": "finance@penguin.com", 
            "password": "FinancePass123!", 
            "full_name": "Finance Manager",
            "role": Role.FINANCE_MANAGER
        },
        {
            "email": "viewer@penguin.com", 
            "password": "ViewerPass123!", 
            "full_name": "Finance Viewer",
            "role": Role.FINANCE_VIEWER
        },
        {
            "email": "moderator@penguin.com", 
            "password": "ModeratorPass123!", 
            "full_name": "Content Moderator",
            "role": Role.MODERATOR
        },
        {
            "email": "analyst@penguin.com", 
            "password": "AnalystPass123!", 
            "full_name": "Data Analyst",
            "role": Role.ANALYST
        }
    ]
    
    async for db in get_db():
        try:
            created_count = 0
            
            for user_data in sample_users:
                # Check if user already exists
                existing_user = await user_service.get_by_email(db, user_data["email"])
                if existing_user:
                    print(f"  ⚠️  User {user_data['email']} already exists, skipping...")
                    continue
                
                # Create user
                user_create = UserCreate(**user_data)
                user = await user_service.create_user(db, user_create)
                created_count += 1
                print(f"  ✅ Created {user.role.value}: {user.email}")
            
            print(f"\n🎉 Created {created_count} sample users!")
            
        except Exception as e:
            await db.rollback()
            print(f"❌ Sample user creation failed: {e}")
            raise
        finally:
            await db.close()
            break


def create_alembic_migration_command():
    """
    Generate the Alembic command needed to create the migration.
    
    Run this command from the backend directory:
    """
    command = """
# 1. Create the migration file:
alembic revision --autogenerate -m "Add role column to users table"

# 2. Review the generated migration file in app/db/migrations/versions/

# 3. Apply the migration:
alembic upgrade head

# 4. Run the data migration script:
python -c "import asyncio; from add_role_migration_example import migrate_user_roles; asyncio.run(migrate_user_roles())"

# 5. (Optional) Create sample users for testing:
python -c "import asyncio; from add_role_migration_example import create_sample_role_users; asyncio.run(create_sample_role_users())"
"""
    
    print("📋 Alembic Migration Commands:")
    print(command)


if __name__ == "__main__":
    import asyncio
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "migrate":
            asyncio.run(migrate_user_roles())
        elif command == "samples":
            asyncio.run(create_sample_role_users())
        elif command == "commands":
            create_alembic_migration_command()
        else:
            print("Usage: python add_role_migration_example.py [migrate|samples|commands]")
    else:
        print("Available commands:")
        print("  migrate  - Migrate existing users to role system")
        print("  samples  - Create sample users with different roles")
        print("  commands - Show Alembic migration commands")
        print("\nUsage: python add_role_migration_example.py <command>")
