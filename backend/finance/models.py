from django.db import models
from django.conf import settings
from market.models import Order


class EscrowTransaction(models.Model):
    """
    Tracks escrow payments for orders.
    """
    class TransactionType(models.TextChoices):
        TOKEN = 'TOKEN', 'Token Payment (20%)'
        FULL = 'FULL', 'Full Payment'
        RELEASE = 'RELEASE', 'Release to Farmer'
        REFUND = 'REFUND', 'Refund to Buyer'
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        SUCCESS = 'SUCCESS', 'Success'
        FAILED = 'FAILED', 'Failed'
    
    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name='transactions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    
    transaction_type = models.CharField(max_length=10, choices=TransactionType.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Payment gateway details (mock for MVP)
    payment_gateway = models.CharField(max_length=20, default='RAZORPAY')
    gateway_transaction_id = models.CharField(max_length=100, blank=True)
    
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.transaction_type} - ₹{self.amount} - {self.status}"
