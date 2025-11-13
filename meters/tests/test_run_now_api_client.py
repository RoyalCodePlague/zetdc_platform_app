from rest_framework.test import APIClient
from django.test import TestCase
from usersAuth.models import User


class RunNowAPIClientTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='apitest', email='api@example.com', password='pass')
        self.client = APIClient()

    def test_run_now_with_api_client_authenticated(self):
        # force authenticate (bypass token/session complexities)
        self.client.force_authenticate(user=self.user)
        resp = self.client.post('/api/meters/auto-recharge/run-now/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json().get('status'), 'started')
