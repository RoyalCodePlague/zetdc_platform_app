# Generated migration: add units to TokenPool and TokenPurchase, create ManualRecharge
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('meters', '0005_meter_last_top_up'),
    ]

    operations = [
        migrations.AddField(
            model_name='tokenpool',
            name='units',
            field=models.DecimalField(blank=True, decimal_places=2, null=True, max_digits=10),
        ),
        migrations.AddField(
            model_name='tokenpurchase',
            name='units',
            field=models.DecimalField(blank=True, decimal_places=2, null=True, max_digits=10),
        ),
        migrations.CreateModel(
            name='ManualRecharge',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token_code', models.CharField(max_length=128)),
                ('masked_token', models.CharField(blank=True, max_length=128)),
                ('units', models.DecimalField(blank=True, decimal_places=2, null=True, max_digits=10)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('success', 'Success'), ('failed', 'Failed'), ('rejected', 'Rejected')], default='pending', max_length=20)),
                ('message', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('applied_at', models.DateTimeField(blank=True, null=True)),
                ('meter', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='manual_recharges', to='meters.meter')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='manual_recharges', to='usersAuth.user')),
            ],
        ),
    ]
