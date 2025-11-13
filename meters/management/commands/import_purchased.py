from django.core.management.base import BaseCommand
from django.conf import settings
import os
import json
from decimal import Decimal
from django.db import transaction
from django.utils.dateparse import parse_datetime


class Command(BaseCommand):
    help = 'Import Token_purchased.json entries into the TokenPurchase DB model.'

    def add_arguments(self, parser):
        parser.add_argument('--path', type=str, help='Path to Token_purchased.json (defaults to project root)')

    def handle(self, *args, **options):
        path = options.get('path') or os.path.join(settings.BASE_DIR, 'Token_purchased.json')

        if not os.path.exists(path):
            self.stdout.write(self.style.ERROR(f'File not found: {path}'))
            return

        try:
            with open(path, 'r', encoding='utf-8') as f:
                text = f.read()

            try:
                entries = json.loads(text)
            except json.JSONDecodeError:
                # fallback: newline-delimited JSON
                entries = [json.loads(line) for line in text.splitlines() if line.strip()]

            from meters.models import TokenPurchase, Meter
            from usersAuth.models import User

            imported = 0
            skipped = 0
            for entry in entries:
                token_code = entry.get('token') or entry.get('token_code')
                if not token_code:
                    continue

                if TokenPurchase.objects.filter(token_code=token_code).exists():
                    skipped += 1
                    continue

                meter = None
                if entry.get('meter_id'):
                    meter = Meter.objects.filter(id=entry.get('meter_id')).first()

                user = None
                if entry.get('user_id'):
                    user = User.objects.filter(id=entry.get('user_id')).first()

                amount_raw = entry.get('amount')
                try:
                    amount = Decimal(str(amount_raw)) if amount_raw is not None else Decimal('0')
                except Exception:
                    amount = Decimal('0')

                purchased_at = None
                if entry.get('purchased_at'):
                    purchased_at = parse_datetime(entry.get('purchased_at'))

                with transaction.atomic():
                    tp = TokenPurchase.objects.create(
                        token_code=token_code,
                        meter=meter,
                        user=user,
                        amount=amount,
                    )
                    if purchased_at:
                        TokenPurchase.objects.filter(pk=tp.pk).update(purchased_at=purchased_at)

                imported += 1

            self.stdout.write(self.style.SUCCESS(f'Imported {imported} entries, skipped {skipped} duplicates.'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error importing purchases: {e}'))