from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('meters', '0003_tokenpool'),
    ]

    operations = [
        migrations.CreateModel(
            name='TokenPurchase',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token_code', models.CharField(max_length=128)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('purchased_at', models.DateTimeField(auto_now_add=True)),
                ('meter', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='purchases', to='meters.meter')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='purchases', to='usersAuth.user')),
            ],
        ),
    ]
