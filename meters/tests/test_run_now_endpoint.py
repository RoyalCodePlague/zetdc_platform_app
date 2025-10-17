from django.test import TestCase, Client
from usersAuth.models import User


class RunNowEndpointTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='runuser', email='run@example.com', password='pass')
        self.client = Client()
        self.client.login(username='runuser', password='pass')

    def test_run_now_endpoint_exists(self):
        resp = self.client.post('/api/meters/auto-recharge/run-now/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('status', resp.json())
        self.assertEqual(resp.json().get('status'), 'started')
