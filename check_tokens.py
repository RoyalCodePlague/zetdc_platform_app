import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from meters.models import TokenPool

total = TokenPool.objects.count()
available = TokenPool.objects.filter(is_allocated=False).count()
allocated = TokenPool.objects.filter(is_allocated=True).count()

print(f"Total tokens in pool: {total}")
print(f"Available tokens: {available}")
print(f"Allocated tokens: {allocated}")

if available == 0 and total == 0:
    print("\n⚠️ NO TOKENS IN DATABASE! Need to import from Tokens.json")
elif available == 0:
    print("\n⚠️ All tokens have been allocated! Need to add more tokens.")
else:
    print(f"\n✅ {available} tokens ready for purchase!")
