from django.db import models
from market.models import Order


class Shipment(models.Model):
    """
    Logistics tracking for crop delivery.
    """
    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', 'Scheduled for Pickup'
        IN_TRANSIT = 'IN_TRANSIT', 'In Transit'
        DELIVERED = 'DELIVERED', 'Delivered'
        FAILED = 'FAILED', 'Delivery Failed'
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='shipment')
    
    pickup_date = models.DateField()
    delivery_date = models.DateField(null=True, blank=True)
    
    # Driver/Transport details (MVP - simple text fields)
    driver_name = models.CharField(max_length=100, blank=True)
    driver_phone = models.CharField(max_length=15, blank=True)
    vehicle_number = models.CharField(max_length=20, blank=True)
    
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.SCHEDULED)
    
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Shipment for Order #{self.order.id} - {self.status}"
