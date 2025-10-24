from django.test import TestCase
from usersAuth.models import User
from meters.models import Meter, AutoRechargeConfig
from meters.utils import run_autorecharge_for_user
from notifications.models import Notification
from decimal import Decimal


class AutoRechargeNotificationTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='notifuser', email='notif@example.com', password='pass')
        self.meter = Meter.objects.create(user=self.user, meter_number='M-100', current_balance=Decimal('1.00'))
        self.cfg = AutoRechargeConfig.objects.create(user=self.user, enabled=True, default_threshold=Decimal('5.00'), default_amount=Decimal('10.00'))

    def test_notification_created_on_completion(self):
        summary = run_autorecharge_for_user(self.user)
        self.assertGreaterEqual(summary.get('executed', 0), 1)
        n = Notification.objects.filter(user=self.user, notification_type='payment').order_by('-created_at').first()
        self.assertIsNotNone(n)
        self.assertIn('Auto recharge', n.title)
