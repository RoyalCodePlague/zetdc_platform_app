#!/usr/bin/env python
"""
Quick diagnostic script to check Railway database configuration
Run this to verify your PostgreSQL setup is correct
"""

import os
import sys

def check_database_config():
    """Check if database is properly configured"""
    
    print("=" * 60)
    print("🔍 RAILWAY DATABASE CONFIGURATION CHECK")
    print("=" * 60)
    print()
    
    # Check if DATABASE_URL is set
    database_url = os.environ.get('DATABASE_URL')
    
    print("1. DATABASE_URL Environment Variable:")
    if database_url:
        print("   ✅ DATABASE_URL is set")
        if 'postgresql' in database_url or 'postgres' in database_url:
            print("   ✅ Using PostgreSQL (GOOD!)")
            # Mask the password in output
            safe_url = database_url.split('@')[1] if '@' in database_url else database_url
            print(f"   📍 Host: {safe_url.split('/')[0] if '/' in safe_url else 'Unknown'}")
        elif 'sqlite' in database_url:
            print("   ⚠️  Using SQLite (Data will be lost on redeploy!)")
        else:
            print(f"   ⚠️  Unknown database type: {database_url[:20]}...")
    else:
        print("   ❌ DATABASE_URL is NOT set!")
        print("   ⚠️  Will fall back to SQLite (ephemeral)")
        print()
        print("   👉 FIX: In Railway Dashboard:")
        print("      1. Add PostgreSQL service")
        print("      2. Set DATABASE_URL=${{Postgres.DATABASE_URL}}")
    
    print()
    
    # Try to load Django settings
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
        import django
        django.setup()
        
        from django.conf import settings
        
        print("2. Django Database Configuration:")
        db_engine = settings.DATABASES['default']['ENGINE']
        db_name = settings.DATABASES['default']['NAME']
        
        if 'postgresql' in db_engine:
            print("   ✅ Django is configured for PostgreSQL")
            print(f"   📍 Database: {db_name}")
        elif 'sqlite' in db_engine:
            print("   ❌ Django is using SQLite")
            print(f"   📍 Database: {db_name}")
            print("   ⚠️  This is EPHEMERAL - data will be lost!")
        
        print()
        
        # Check if database is accessible
        print("3. Database Connection Test:")
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                print("   ✅ Database connection successful!")
                
                # Check if tables exist
                cursor.execute("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                """)
                tables = cursor.fetchall()
                
                if tables:
                    print(f"   ✅ Found {len(tables)} tables")
                    print("   📋 Sample tables:")
                    for table in tables[:5]:
                        print(f"      - {table[0]}")
                else:
                    print("   ⚠️  No tables found (run migrations)")
                    
        except Exception as e:
            print(f"   ❌ Connection failed: {e}")
        
        print()
        
        # Check for users
        print("4. User Data Check:")
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user_count = User.objects.count()
            
            if user_count > 0:
                print(f"   ✅ Found {user_count} user(s)")
                print("   💾 Data is being persisted!")
            else:
                print("   ⚠️  No users found")
                print("   💡 Create a user to test persistence")
        except Exception as e:
            print(f"   ⚠️  Cannot check users: {e}")
            
    except Exception as e:
        print(f"   ❌ Cannot load Django: {e}")
        print("   💡 Run this script in your Django project directory")
    
    print()
    print("=" * 60)
    print("📋 SUMMARY")
    print("=" * 60)
    
    if database_url and ('postgresql' in database_url or 'postgres' in database_url):
        print("✅ Configuration looks GOOD!")
        print("   Your data should persist across deployments.")
    else:
        print("❌ Configuration has ISSUES!")
        print("   Follow FIX_DATABASE_PERSISTENCE.md to fix.")
    
    print()
    print("📖 For detailed instructions, see:")
    print("   - FIX_DATABASE_PERSISTENCE.md")
    print("   - DATABASE_SAFETY_GUIDE.md")
    print("=" * 60)

if __name__ == '__main__':
    check_database_config()
