from django.core.management.base import BaseCommand
from meters.models import TokenPool, Token, TokenPurchase
from django.db import transaction

class Command(BaseCommand):
    help = 'Backfill units and amount for Token and TokenPurchase from TokenPool by token_code. Dry-run by default.'

    def add_arguments(self, parser):
        parser.add_argument('--apply', action='store_true', help='Apply changes to the database')
        parser.add_argument('--treat-zero-as-missing', action='store_true', help='Treat 0.00 units on Token/TokenPurchase as missing and overwrite')
        parser.add_argument('--create-manuals', action='store_true', help='Create ManualRecharge audit entries for existing Token/TokenPurchase rows that lack them')

    def handle(self, *args, **options):
        apply_changes = options['apply']
        treat_zero = options['treat_zero_as_missing']

        pool_map = {p.token_code: p for p in TokenPool.objects.all()}
        self.stdout.write(f'Loaded {len(pool_map)} TokenPool entries')

        tokens = Token.objects.all()
        purchases = TokenPurchase.objects.all()

        token_updates = []
        purchase_updates = []

        # Check Tokens
        for t in tokens:
            pool = pool_map.get(t.token_code)
            if not pool:
                continue
            # decide if we should update
            should_update = False
            if t.units is None:
                should_update = True
            else:
                try:
                    if treat_zero and float(t.units) == 0.0:
                        should_update = True
                except Exception:
                    pass

            if should_update and pool.units is not None:
                token_updates.append((t, pool.units, pool.amount))

        # Check TokenPurchases
        for p in purchases:
            pool = pool_map.get(p.token_code)
            if not pool:
                continue
            should_update = False
            if p.units is None:
                should_update = True
            else:
                try:
                    if treat_zero and float(p.units) == 0.0:
                        should_update = True
                except Exception:
                    pass

            if should_update and pool.units is not None:
                purchase_updates.append((p, pool.units, pool.amount))

        self.stdout.write(f'Found {len(token_updates)} Token rows to update, {len(purchase_updates)} TokenPurchase rows to update')

        if not apply_changes:
            self.stdout.write('Dry-run mode: no changes applied. Use --apply to write changes.')
            # show some samples
            for t, units, amount in token_updates[:10]:
                self.stdout.write(f'Token id={t.id} code={t.token_code} will get units={units} amount={amount}')
            for p, units, amount in purchase_updates[:10]:
                self.stdout.write(f'Purchase id={p.id} code={p.token_code} will get units={units} amount={amount}')
            # show manual recharge creation candidates
            if options.get('create_manuals'):
                from meters.models import ManualRecharge
                token_manual_candidates = []
                purchase_manual_candidates = []
                for tok in Token.objects.all():
                    if not ManualRecharge.objects.filter(token_code=tok.token_code, status='success').exists():
                        token_manual_candidates.append(tok)
                for pur in TokenPurchase.objects.all():
                    if not ManualRecharge.objects.filter(token_code=pur.token_code, status='success').exists():
                        purchase_manual_candidates.append(pur)
                self.stdout.write(f'Would create {len(token_manual_candidates)} ManualRecharge entries from Token, and {len(purchase_manual_candidates)} from TokenPurchase')
            return

        # Apply changes within a transaction
        with transaction.atomic():
            for t, units, amount in token_updates:
                t.units = units
                if amount is not None:
                    t.amount = amount
                t.save(update_fields=['units', 'amount'])
            for p, units, amount in purchase_updates:
                p.units = units
                if amount is not None:
                    p.units = units
                p.save(update_fields=['units'])

            # optionally create ManualRecharge audit records for existing tokens/purchases
            if options.get('create_manuals'):
                from meters.models import ManualRecharge
                from django.utils import timezone
                created_manuals = 0
                for tok in Token.objects.all():
                    if not ManualRecharge.objects.filter(token_code=tok.token_code, status='success').exists():
                        try:
                            ManualRecharge.objects.create(
                                token_code=tok.token_code,
                                meter=tok.meter,
                                user=(tok.meter.user if tok.meter and hasattr(tok.meter, 'user') else None),
                                units=tok.units,
                                status='success',
                                applied_at=(tok.used_at or tok.created_at or timezone.now()),
                                message='Backfilled from Token'
                            )
                            created_manuals += 1
                        except Exception:
                            pass
                for pur in TokenPurchase.objects.all():
                    if not ManualRecharge.objects.filter(token_code=pur.token_code, status='success').exists():
                        try:
                            ManualRecharge.objects.create(
                                token_code=pur.token_code,
                                meter=pur.meter,
                                user=(pur.user if hasattr(pur, 'user') else None),
                                units=pur.units,
                                status='success',
                                applied_at=(pur.purchased_at or timezone.now()),
                                message='Backfilled from TokenPurchase'
                            )
                            created_manuals += 1
                        except Exception:
                            pass
                self.stdout.write(self.style.SUCCESS(f'Created {created_manuals} ManualRecharge audit records'))

        self.stdout.write(self.style.SUCCESS(f'Applied changes: {len(token_updates)} Token rows, {len(purchase_updates)} Purchase rows'))
