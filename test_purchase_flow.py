"""
Test script to verify the electricity purchase flow
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from meters.models import TokenPool, Meter
from usersAuth.models import User
from transactions.models import Transaction

# Check system status
print("=" * 60)
print("SYSTEM STATUS CHECK")
print("=" * 60)

# 1. Check tokens
total_tokens = TokenPool.objects.count()
available_tokens = TokenPool.objects.filter(is_allocated=False).count()
allocated_tokens = TokenPool.objects.filter(is_allocated=True).count()

print(f"\n📦 TOKEN POOL:")
print(f"   Total tokens: {total_tokens}")
print(f"   Available: {available_tokens}")
print(f"   Allocated: {allocated_tokens}")

if available_tokens == 0:
    print("   ⚠️ WARNING: No available tokens for purchase!")
else:
    print(f"   ✅ System ready with {available_tokens} tokens")

# 2. Check users
user_count = User.objects.count()
print(f"\n👥 USERS: {user_count} registered")
if user_count > 0:
    sample_user = User.objects.first()
    print(f"   Sample user: {sample_user.email}")

# 3. Check meters
meter_count = Meter.objects.count()
print(f"\n⚡ METERS: {meter_count} registered")
if meter_count > 0:
    sample_meter = Meter.objects.first()
    print(f"   Sample meter: {sample_meter.meter_number}")
    print(f"   Owner: {sample_meter.user.email if sample_meter.user else 'No owner'}")

# 4. Check transactions
tx_count = Transaction.objects.count()
completed_tx = Transaction.objects.filter(status='completed').count()
pending_tx = Transaction.objects.filter(status='pending').count()
failed_tx = Transaction.objects.filter(status='failed').count()

print(f"\n💳 TRANSACTIONS:")
print(f"   Total: {tx_count}")
print(f"   Completed: {completed_tx}")
print(f"   Pending: {pending_tx}")
print(f"   Failed: {failed_tx}")

# 5. Show recent transactions
print(f"\n📊 RECENT TRANSACTIONS (Last 5):")
recent_txs = Transaction.objects.order_by('-created_at')[:5]
if recent_txs:
    for tx in recent_txs:
        print(f"   • {tx.transaction_id[:8]}... | ${tx.amount} | {tx.status} | {tx.created_at.strftime('%Y-%m-%d %H:%M')}")
else:
    print("   No transactions yet")

print("\n" + "=" * 60)
print("PURCHASE FLOW VERIFICATION")
print("=" * 60)

if available_tokens > 0 and meter_count > 0:
    print("✅ System is ready for purchases!")
    print("\nTo test purchase:")
    print("1. Go to the dashboard")
    print("2. Select a meter and amount")
    print("3. Choose payment method")
    print("4. Click 'Purchase Electricity'")
    print("5. Wait 3-5 seconds for token allocation")
else:
    if available_tokens == 0:
        print("❌ No tokens available - import tokens first")
    if meter_count == 0:
        print("❌ No meters registered - add a meter first")

print("\n" + "=" * 60)
