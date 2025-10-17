from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a superuser if one does not exist'

    def handle(self, *args, **options):
        # Check if any superuser exists
        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write(self.style.WARNING('Superuser already exists.'))
            return

        # Get credentials from environment variables or use defaults
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@zetdc.com')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin123456')

        # Create superuser
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )

        self.stdout.write(
            self.style.SUCCESS(f'Superuser "{username}" created successfully!')
        )
        self.stdout.write(
            self.style.WARNING(f'Username: {username}')
        )
        self.stdout.write(
            self.style.WARNING('Password: (check DJANGO_SUPERUSER_PASSWORD env var or default)')
        )
