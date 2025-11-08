#!/usr/bin/env python
"""
Script to import tokens from Tokens.json to Railway PostgreSQL database.
Run this AFTER deploying to Railway to populate the token pool.

Usage:
    Set DATABASE_URL environment variable to your Railway PostgreSQL connection string
    python import_tokens_to_railway.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.management import call_command

def main():
    print("=" * 60)
    print("🔄 IMPORTING TOKENS TO RAILWAY DATABASE")
    print("=" * 60)
    print()
    
    # Check if DATABASE_URL is set
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("❌ ERROR: DATABASE_URL environment variable is not set!")
        print()
        print("To import tokens to Railway:")
        print("1. Go to your Railway dashboard")
        print("2. Click on your PostgreSQL service")
        print("3. Copy the DATABASE_URL from the Variables tab")
        print("4. Run this command:")
        print()
        print('   $env:DATABASE_URL="postgresql://..." ; python import_tokens_to_railway.py')
        print()
        sys.exit(1)
    
    if 'postgresql' not in database_url and 'postgres' not in database_url:
        print("⚠️  WARNING: DATABASE_URL doesn't look like PostgreSQL!")
        print(f"   Current: {database_url[:50]}...")
        response = input("\nContinue anyway? (y/N): ")
        if response.lower() != 'y':
            sys.exit(1)
    
    print("✅ Connected to PostgreSQL")
    print()
    
    # Import tokens
    try:
        print("📥 Importing tokens from Tokens.json...")
        call_command('import_tokens')
        print()
        print("✅ SUCCESS! Tokens imported to Railway database")
        print()
        
        # Show statistics
        from meters.models import TokenPool
        total = TokenPool.objects.count()
        available = TokenPool.objects.filter(is_allocated=False).count()
        allocated = TokenPool.objects.filter(is_allocated=True).count()
        
        print("📊 Token Pool Statistics:")
        print(f"   Total tokens: {total}")
        print(f"   Available: {available}")
        print(f"   Allocated: {allocated}")
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        print()
        print("💡 Make sure:")
        print("   1. Migrations have been run on Railway")
        print("   2. Tokens.json exists in the project root")
        print("   3. DATABASE_URL is correct")
        sys.exit(1)
    
    print()
    print("=" * 60)

if __name__ == '__main__':
    main()
