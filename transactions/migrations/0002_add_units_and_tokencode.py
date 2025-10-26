from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transactions', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='transaction',
            name='units',
            field=models.DecimalField(blank=True, decimal_places=2, null=True, max_digits=10),
        ),
        migrations.AddField(
            model_name='transaction',
            name='token_code',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
    ]
