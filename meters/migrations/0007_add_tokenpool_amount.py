from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('meters', '0006_add_units_and_manualrecharge'),
    ]

    operations = [
        migrations.AddField(
            model_name='tokenpool',
            name='amount',
            field=models.DecimalField(blank=True, decimal_places=2, null=True, max_digits=10),
        ),
    ]
