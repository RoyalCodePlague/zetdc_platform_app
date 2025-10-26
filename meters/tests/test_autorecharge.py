from django.test import TestCase
from django.urls import reverse
from usersAuth.models import User
from rest_framework.test import APIClient
from meters.models import AutoRechargeConfig, AutoRechargeEvent, Meter
from decimal import Decimal

class AutoRechargeAPITest(TestCase):
    def setUp(self):
        # project User model requires username; provide both username and email
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='password123')
        self.client = APIClient()
        # use simple session auth by force-authenticating the client with user
        self.client.force_authenticate(user=self.user)
        # create a meter
        self.meter = Meter.objects.create(user=self.user, meter_number='1234567890', nickname='Home', address='Addr', current_balance=Decimal('5.00'))

    def test_get_and_save_config(self):
        url = '/api/meters/auto-recharge/settings/'
        # get default (created)
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        self.assertIn('enabled', resp.data)
        # save config
        payload = { 'enabled': True, 'default_threshold': '10.00', 'default_amount': '20.00', 'default_payment_method': 'card' }
        resp2 = self.client.post(url, payload, format='json')
        self.assertEqual(resp2.status_code, 200)
        cfg = AutoRechargeConfig.objects.get(user=self.user)
        self.assertTrue(cfg.enabled)
        self.assertEqual(str(cfg.default_threshold), '10.00')

    def test_list_events_and_trigger(self):
        events_url = '/api/meters/auto-recharge/events/'
        # initially none
        r = self.client.get(events_url)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.data), 0)
        # trigger for meter
        trigger_url = f'/api/meters/auto-recharge/trigger/{self.meter.id}/'
        r2 = self.client.post(trigger_url, {'amount': '15.00'}, format='json')
        self.assertEqual(r2.status_code, 200)
        self.assertIn('id', r2.data)
        # events should now include the created event
        r3 = self.client.get(events_url)
        self.assertEqual(r3.status_code, 200)
        self.assertGreaterEqual(len(r3.data), 1)
