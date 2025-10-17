from django.db import models
from usersAuth.models import User
from meters.models import Meter

class Transaction(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    TRANSACTION_TYPE_CHOICES = [
        ('purchase', 'Purchase'),
        ('recharge', 'Recharge'),
        ('refund', 'Refund'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    meter = models.ForeignKey(Meter, on_delete=models.SET_NULL, null=True, related_name='transactions')
    transaction_id = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    # energy units credited by this transaction (kWh)
    units = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    # token applied in this transaction (if any)
    token_code = models.CharField(max_length=128, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    payment_method = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.transaction_id} - {self.amount}"