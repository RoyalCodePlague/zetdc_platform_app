# Generated migration to update meter_number max_length

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usersAuth', '0005_accountdeletionrequest_dataexportrequest'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='meter_number',
            field=models.CharField(blank=True, max_length=15, null=True, unique=True),
        ),
    ]
