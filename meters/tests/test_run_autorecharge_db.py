from django.test import TestCase
from usersAuth.models import User
from meters.models import Meter, AutoRechargeConfig, AutoRechargeEvent
from meters.utils import run_autorecharge_for_user
from decimal import Decimal


class RunAutoRechargeDBTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='pass')
        # create a meter with low balance
        self.meter = Meter.objects.create(user=self.user, meter_number='M-001', current_balance=Decimal('5.00'))
        # config: enabled, threshold 10, amount 20
        self.cfg = AutoRechargeConfig.objects.create(user=self.user, enabled=True, default_threshold=Decimal('10.00'), default_amount=Decimal('20.00'))

    def test_run_autorecharge_creates_event_and_updates_balance(self):
        summary = run_autorecharge_for_user(self.user)
        # one triggered and one executed
        self.assertGreaterEqual(summary.get('triggered', 0), 1)
        self.assertGreaterEqual(summary.get('executed', 0), 1)

        # check event exists
        ev = AutoRechargeEvent.objects.filter(user=self.user, meter=self.meter).order_by('-id').first()
        self.assertIsNotNone(ev)
        self.assertEqual(ev.status, 'completed')

        # meter balance increased by amount
        m = Meter.objects.get(pk=self.meter.pk)
        self.assertEqual(m.current_balance, Decimal('25.00'))
