#!/usr/bin/env python3
"""
Test runner script for the permission system.

This script provides an easy way to run the permission and role tests.
"""

import subprocess
import sys
from pathlib import Path


def run_command(command: str, description: str):
    """Run a command and handle errors."""
    print(f"\n🔄 {description}...")
    print(f"Running: {command}")
    
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    
    if result.returncode == 0:
        print(f"✅ {description} - SUCCESS")
        if result.stdout:
            print(result.stdout)
    else:
        print(f"❌ {description} - FAILED")
        if result.stderr:
            print("STDERR:", result.stderr)
        if result.stdout:
            print("STDOUT:", result.stdout)
        return False
    
    return True


def main():
    """Main test runner function."""
    print("🚀 Running Permission System Tests")
    print("=" * 50)
    
    # Change to the backend directory
    backend_dir = Path(__file__).parent
    print(f"Working directory: {backend_dir}")
    
    # Test commands to run
    test_commands = [
        {
            "command": "python -m pytest app/tests/test_roles.py -v",
            "description": "Role System Tests"
        },
        {
            "command": "python -m pytest app/tests/test_permissions.py -v",
            "description": "Permission System Tests"
        },
        {
            "command": "python -m pytest app/tests/test_roles.py app/tests/test_permissions.py -v --tb=short",
            "description": "All Permission-Related Tests"
        }
    ]
    
    all_passed = True
    
    for test_config in test_commands:
        success = run_command(test_config["command"], test_config["description"])
        if not success:
            all_passed = False
    
    print("\n" + "=" * 50)
    if all_passed:
        print("🎉 All tests PASSED!")
        return 0
    else:
        print("💥 Some tests FAILED!")
        return 1


if __name__ == "__main__":
    sys.exit(main())
