from django.core.management.base import BaseCommand
from meters.utils import run_autorecharge_for_user
from meters.models import AutoRechargeConfig


class Command(BaseCommand):
    help = 'Run auto-recharge checks and perform mock recharges where configured'

    def handle(self, *args, **options):
        configs = AutoRechargeConfig.objects.filter(enabled=True)
        total_triggered = 0
        total_executed = 0
        total_failed = 0
        for cfg in configs:
            user = cfg.user
            result = run_autorecharge_for_user(user, stdout=self.stdout)
            total_triggered += result.get('triggered', 0)
            total_executed += result.get('executed', 0)
            total_failed += result.get('failed', 0)
        self.stdout.write(f'Done - triggered={total_triggered} executed={total_executed} failed={total_failed}')
