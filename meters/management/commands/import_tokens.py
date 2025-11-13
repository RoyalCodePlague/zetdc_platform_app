from django.core.management.base import BaseCommand
from django.conf import settings
import os, json
from meters.models import TokenPool

class Command(BaseCommand):
    help = 'Import tokens from Tokens.json into TokenPool'

    def handle(self, *args, **options):
        tokens_path = os.path.join(settings.BASE_DIR, 'Tokens.json')
        if not os.path.exists(tokens_path):
            self.stdout.write(self.style.ERROR(f'Tokens.json not found at {tokens_path}'))
            return

        with open(tokens_path, 'r', encoding='utf-8') as f:
            tokens = json.load(f)

        created = 0
        for t in tokens:
            code = t.get('token') or t.get('token_code')
            if not code:
                continue
            # Prefer explicit amount (monetary) and units (kWh) keys
            amount = t.get('amount') if t.get('amount') is not None else t.get('price')
            units = t.get('units') or t.get('kwh')
            obj, was_created = TokenPool.objects.get_or_create(token_code=str(code))
            # Update existing records too with provided metadata
            changed = False
            if amount is not None:
                try:
                    obj.amount = float(amount)
                    changed = True
                except Exception:
                    pass
            if units is not None:
                try:
                    obj.units = float(units)
                    changed = True
                except Exception:
                    pass
            if changed:
                obj.save(update_fields=[f for f in (['amount'] if amount is not None else []) + (['units'] if units is not None else [])])
            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(f'Imported {created} tokens into TokenPool'))
