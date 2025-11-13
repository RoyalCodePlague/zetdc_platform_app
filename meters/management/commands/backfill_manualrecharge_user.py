from django.core.management.base import BaseCommand
from meters.models import ManualRecharge


class Command(BaseCommand):
    help = 'Backfill ManualRecharge.user from ManualRecharge.meter.user when user is null. Dry-run by default.'

    def add_arguments(self, parser):
        parser.add_argument('--apply', action='store_true', help='Apply changes to the database')

    def handle(self, *args, **options):
        apply_changes = options['apply']
        qs = ManualRecharge.objects.filter(user__isnull=True)
        total = qs.count()
        self.stdout.write(f'Found {total} ManualRecharge rows with null user')

        samples = list(qs.order_by('-created_at')[:20])
        for s in samples:
            meter_user = s.meter.user.id if s.meter and s.meter.user else None
            self.stdout.write(f'id={s.id} token={s.token_code} meter_id={s.meter.id if s.meter else None} meter_user={meter_user} status={s.status} created_at={s.created_at}')

        if not apply_changes:
            self.stdout.write('Dry-run: no changes applied. Use --apply to set user from meter.user where available.')
            return

        updated = 0
        for s in qs:
            if s.meter and s.meter.user:
                s.user = s.meter.user
                s.save(update_fields=['user'])
                updated += 1

        self.stdout.write(self.style.SUCCESS(f'Updated {updated} ManualRecharge rows with user from meter.user'))
