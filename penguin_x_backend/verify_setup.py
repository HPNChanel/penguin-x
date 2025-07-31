#!/usr/bin/env python3
"""
Setup verification script for Penguin X Backend.

This script verifies that all components are properly configured.
"""

import sys
import os
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))


def check_file_exists(file_path: str, description: str) -> bool:
    """Check if a file exists."""
    path = Path(file_path)
    exists = path.exists()
    status = "✅" if exists else "❌"
    print(f"{status} {description}: {file_path}")
    return exists


def check_import(module_name: str, description: str) -> bool:
    """Check if a module can be imported."""
    try:
        __import__(module_name)
        print(f"✅ {description}: {module_name}")
        return True
    except ImportError as e:
        print(f"❌ {description}: {module_name} - {e}")
        return False


def check_alembic_config() -> bool:
    """Check Alembic configuration."""
    print("\n📁 Checking Alembic Configuration...")
    
    checks = [
        check_file_exists("alembic.ini", "Alembic config file"),
        check_file_exists("app/db/migrations/env.py", "Alembic environment"),
        check_file_exists("app/db/migrations/script.py.mako", "Migration template"),
        check_file_exists("app/db/migrations/versions", "Versions directory"),
        check_file_exists("app/models/base.py", "Base model file"),
    ]
    
    return all(checks)


def check_models() -> bool:
    """Check model imports."""
    print("\n🏗️  Checking Models...")
    
    checks = [
        check_import("app.models.base", "Base model classes"),
        check_import("app.models.user", "User model"),
    ]
    
    return all(checks)


def check_database_config() -> bool:
    """Check database configuration."""
    print("\n🗄️  Checking Database Configuration...")
    
    try:
        from app.core.config import settings
        
        # Check if DATABASE_URL is configured
        if hasattr(settings, 'DATABASE_URL') and settings.DATABASE_URL:
            print(f"✅ Database URL configured: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else 'local'}")
            db_url_ok = True
        else:
            print("❌ DATABASE_URL not configured in settings")
            db_url_ok = False
        
        # Check if session file exists (don't import to avoid connection issues)
        session_file_ok = check_file_exists("app/db/session.py", "Database session file")
        
        return db_url_ok and session_file_ok
        
    except Exception as e:
        print(f"❌ Error checking database config: {e}")
        return False


def check_alembic_metadata() -> bool:
    """Check if Alembic can access metadata."""
    print("\n🔍 Checking Alembic Metadata Access...")
    
    try:
        # Import the metadata from our base
        from app.models.base import Base
        from app.models.user import User  # Import to register with metadata
        
        # Check if metadata has tables
        table_count = len(Base.metadata.tables)
        if table_count > 0:
            print(f"✅ Metadata contains {table_count} table(s):")
            for table_name in Base.metadata.tables.keys():
                print(f"   - {table_name}")
            return True
        else:
            print("❌ No tables found in metadata")
            return False
            
    except Exception as e:
        print(f"❌ Error accessing metadata: {e}")
        return False


def check_migration_script() -> bool:
    """Check if migration management script works."""
    print("\n🔧 Checking Migration Management Script...")
    
    return check_file_exists("manage_db.py", "Migration management script")


def main():
    """Run all checks."""
    print("🔍 Penguin X Backend Setup Verification")
    print("=" * 50)
    
    checks = [
        check_alembic_config(),
        check_models(),
        check_database_config(),
        check_alembic_metadata(),
        check_migration_script(),
    ]
    
    print("\n" + "=" * 50)
    
    if all(checks):
        print("🎉 All checks passed! Your setup is ready for migrations.")
        print("\nNext steps:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Configure .env file with DATABASE_URL")
        print("3. Initialize database: python manage_db.py init")
        print("4. Start application: python start.py")
        return True
    else:
        print("❌ Some checks failed. Please fix the issues above.")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)