#!/usr/bin/env python3
"""
Seed Script: Create or Update Administrator Account
Faculty Performance and Academic Activity Dashboard

Usage Examples:
  # Non-interactive CLI mode:
  python create_admin.py --email admin@university.edu --password MySecurePassword123 --name "Dr. Administrator"

  # Interactive prompt mode (secure masked password input):
  python create_admin.py
"""

import sys
import os
import argparse
import getpass
import re

# Ensure backend directory is in python module search path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(BASE_DIR, ".env"))

from app.database import SessionLocal, init_db
from app.models import User
from app.security import hash_password

EMAIL_REGEX = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


def create_or_update_admin(email: str, password: str, name: str, role: str = "Administrator"):
    email = email.strip().lower()
    if not re.match(EMAIL_REGEX, email):
        raise ValueError(f"Invalid email address format: '{email}'. Must be a valid email (e.g. admin@university.edu).")

    if not password or len(password) < 6:
        raise ValueError("Password must be at least 6 characters long.")

    # Ensure tables exist
    init_db()

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        hashed = hash_password(password)

        if user:
            user.hashed_password = hashed
            user.name = name or user.name
            user.role = role or user.role
            user.is_active = True
            db.commit()
            print(f"[SUCCESS] Updated existing administrator account for: {email}")
            return user.id
        else:
            new_user = User(
                email=email,
                hashed_password=hashed,
                name=name or "Administrator",
                role=role or "Administrator",
                is_active=True
            )
            db.add(new_user)
            db.commit()
            print(f"[SUCCESS] Created new administrator account for: {email}")
            return new_user.id
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(
        description="Provision or update an administrator account for FacultyHub."
    )
    parser.add_argument("--email", help="Administrator institutional email address")
    parser.add_argument("--password", help="Administrator password (min 6 characters)")
    parser.add_argument("--name", help="Full name of administrator")
    parser.add_argument("--role", default="Administrator & Academic Coordinator", help="Role title")

    args = parser.parse_args()

    email = args.email
    password = args.password
    name = args.name
    role = args.role

    # Interactive mode if arguments are not provided via flags
    if not email:
        try:
            email = input("Institutional Email: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nAborted.")
            sys.exit(1)

    if not name:
        try:
            name_input = input("Full Name [Administrator]: ").strip()
            name = name_input if name_input else "Administrator"
        except (KeyboardInterrupt, EOFError):
            print("\nAborted.")
            sys.exit(1)

    if not password:
        try:
            password = getpass.getpass("Password (masked): ")
            confirm_password = getpass.getpass("Confirm Password: ")
            if password != confirm_password:
                print("Error: Passwords do not match.", file=sys.stderr)
                sys.exit(1)
        except (KeyboardInterrupt, EOFError):
            print("\nAborted.")
            sys.exit(1)

    try:
        create_or_update_admin(email, password, name, role)
        print("Administrator credentials saved securely as a salted bcrypt hash.")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
