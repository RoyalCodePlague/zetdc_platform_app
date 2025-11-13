from django.db import models
from usersAuth.models import User

class Meter(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meters')
    meter_number = models.CharField(max_length=50, unique=True)
    nickname = models.CharField(max_length=100, blank=True)
    address = models.TextField()
    is_primary = models.BooleanField(default=False)
    auto_recharge_enabled = models.BooleanField(default=False)
    auto_recharge_threshold = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    auto_recharge_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    current_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    # timestamp of the last successful top-up (token recharge)
    last_top_up = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.meter_number} - {self.user.email}"

class Token(models.Model):
    meter = models.ForeignKey(Meter, on_delete=models.CASCADE, related_name='tokens')
    token_code = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    units = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.token_code} - {self.meter.meter_number}"


class TokenPool(models.Model):
    """Pool of available tokens for allocation (DB-backed replacement for Tokens.json)."""
    token_code = models.CharField(max_length=64, unique=True)
    is_allocated = models.BooleanField(default=False)
    allocated_at = models.DateTimeField(null=True, blank=True)
    allocated_to = models.ForeignKey('usersAuth.User', null=True, blank=True, on_delete=models.SET_NULL)
    allocated_transaction_id = models.CharField(max_length=100, null=True, blank=True)
    # optional units/amount the token represents (kWh)
    units = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    # optional monetary amount (price) that this token corresponds to (e.g., 10.00 for $10 tokens)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.token_code


class TokenPurchase(models.Model):
    """Audit record for purchased tokens (DB-backed replacement for Token_purchased.json)."""
    token_code = models.CharField(max_length=128)
    meter = models.ForeignKey(Meter, on_delete=models.SET_NULL, null=True, related_name='purchases')
    user = models.ForeignKey('usersAuth.User', on_delete=models.SET_NULL, null=True, related_name='purchases')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    units = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    purchased_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.token_code} purchased for {self.meter}"


class ManualRecharge(models.Model):
    """Record of manually-entered tokens and their application status."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('rejected', 'Rejected'),
    ]

    token_code = models.CharField(max_length=128)
    masked_token = models.CharField(max_length=128, blank=True)
    meter = models.ForeignKey(Meter, on_delete=models.SET_NULL, null=True, related_name='manual_recharges')
    user = models.ForeignKey('usersAuth.User', on_delete=models.SET_NULL, null=True, related_name='manual_recharges')
    units = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    applied_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.masked_token and self.token_code:
            t = str(self.token_code)
            if len(t) >= 8:
                self.masked_token = t[:4] + '****' + t[-4:]
            else:
                self.masked_token = t
        super().save(*args, **kwargs)

    def __str__(self):
        return f"ManualRecharge {self.masked_token} for {self.meter} ({self.status})"


class AutoRechargeConfig(models.Model):
    """Per-user auto-recharge configuration (defaults to apply across meters)."""
    user = models.OneToOneField('usersAuth.User', on_delete=models.CASCADE, related_name='auto_recharge_config')
    enabled = models.BooleanField(default=False)
    default_threshold = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    default_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    default_payment_method = models.CharField(max_length=100, blank=True)
    time_window_start = models.TimeField(null=True, blank=True)
    time_window_end = models.TimeField(null=True, blank=True)
    apply_to_all = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"AutoRechargeConfig for {self.user.email} (enabled={self.enabled})"


class AutoRechargeEvent(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey('usersAuth.User', on_delete=models.CASCADE, related_name='auto_recharge_events')
    meter = models.ForeignKey(Meter, on_delete=models.SET_NULL, null=True, blank=True, related_name='auto_recharge_events')
    triggered_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    message = models.TextField(blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    executed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"AutoRechargeEvent {self.status} for {self.user.email} @ {self.triggered_at.isoformat()}"