#!/usr/bin/env python3
"""
Database management utility script.

This script provides convenient commands for managing database migrations
and operations using Alembic.
"""

import sys
import subprocess
import argparse
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))


def run_command(cmd: list[str], description: str = None):
    """Run a command and handle errors."""
    if description:
        print(f"🔄 {description}...")
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        if description:
            print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e}")
        if e.stdout:
            print("STDOUT:", e.stdout)
        if e.stderr:
            print("STDERR:", e.stderr)
        return False


def create_migration(message: str):
    """Create a new migration with autogenerate."""
    cmd = ["alembic", "revision", "--autogenerate", "-m", message]
    return run_command(cmd, f"Creating migration: {message}")


def upgrade_database(revision: str = "head"):
    """Upgrade database to specified revision."""
    cmd = ["alembic", "upgrade", revision]
    return run_command(cmd, f"Upgrading database to {revision}")


def downgrade_database(revision: str):
    """Downgrade database to specified revision."""
    cmd = ["alembic", "downgrade", revision]
    return run_command(cmd, f"Downgrading database to {revision}")


def show_current_revision():
    """Show current database revision."""
    cmd = ["alembic", "current"]
    return run_command(cmd, "Showing current revision")


def show_migration_history():
    """Show migration history."""
    cmd = ["alembic", "history", "--verbose"]
    return run_command(cmd, "Showing migration history")


def stamp_database(revision: str):
    """Stamp database with specific revision without running migrations."""
    cmd = ["alembic", "stamp", revision]
    return run_command(cmd, f"Stamping database with revision {revision}")


def init_database():
    """Initialize database with initial migration."""
    print("🚀 Initializing database...")
    
    # First, create initial migration
    if create_migration("Initial migration"):
        # Then apply it
        if upgrade_database():
            print("🎉 Database initialization completed!")
            return True
    
    print("❌ Database initialization failed!")
    return False


def reset_database():
    """Reset database by downgrading to base and re-upgrading."""
    print("⚠️  WARNING: This will reset your database!")
    response = input("Are you sure you want to continue? (y/N): ")
    
    if response.lower() != 'y':
        print("Operation cancelled.")
        return False
    
    print("🔄 Resetting database...")
    
    # Downgrade to base
    if downgrade_database("base"):
        # Upgrade back to head
        if upgrade_database():
            print("🎉 Database reset completed!")
            return True
    
    print("❌ Database reset failed!")
    return False


def main():
    """Main CLI interface."""
    parser = argparse.ArgumentParser(description="Database management utility")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Create migration
    create_parser = subparsers.add_parser("create", help="Create a new migration")
    create_parser.add_argument("message", help="Migration message")
    
    # Upgrade
    upgrade_parser = subparsers.add_parser("upgrade", help="Upgrade database")
    upgrade_parser.add_argument("revision", nargs="?", default="head", help="Target revision (default: head)")
    
    # Downgrade
    downgrade_parser = subparsers.add_parser("downgrade", help="Downgrade database")
    downgrade_parser.add_argument("revision", help="Target revision")
    
    # Current
    subparsers.add_parser("current", help="Show current revision")
    
    # History
    subparsers.add_parser("history", help="Show migration history")
    
    # Stamp
    stamp_parser = subparsers.add_parser("stamp", help="Stamp database with revision")
    stamp_parser.add_argument("revision", help="Revision to stamp")
    
    # Init
    subparsers.add_parser("init", help="Initialize database with initial migration")
    
    # Reset
    subparsers.add_parser("reset", help="Reset database (downgrade to base and upgrade)")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    # Execute command
    success = False
    
    if args.command == "create":
        success = create_migration(args.message)
    elif args.command == "upgrade":
        success = upgrade_database(args.revision)
    elif args.command == "downgrade":
        success = downgrade_database(args.revision)
    elif args.command == "current":
        success = show_current_revision()
    elif args.command == "history":
        success = show_migration_history()
    elif args.command == "stamp":
        success = stamp_database(args.revision)
    elif args.command == "init":
        success = init_database()
    elif args.command == "reset":
        success = reset_database()
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()