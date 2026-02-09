from django.db import models
from django.conf import settings
from core.models import CropVariety


class CropListing(models.Model):
    """
    Farmer's crop listing for sale.
    """
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        SOLD = 'SOLD', 'Sold'
        EXPIRED = 'EXPIRED', 'Expired'
        CANCELLED = 'CANCELLED', 'Cancelled'
    
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listings')
    crop_variety = models.ForeignKey(CropVariety, on_delete=models.PROTECT)
    
    quantity_quintals = models.DecimalField(max_digits=10, decimal_places=2, help_text="Quantity in quintals (100kg)")
    expected_price_per_quintal = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Location
    location_description = models.CharField(max_length=200)
    district = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    
    # Quality (self-declared by farmer)
    moisture_content = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Moisture %")
    foreign_matter = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Foreign matter %")
    
    # Images
    image1 = models.ImageField(upload_to='listings/', null=True, blank=True)
    image2 = models.ImageField(upload_to='listings/', null=True, blank=True)
    image3 = models.ImageField(upload_to='listings/', null=True, blank=True)
    
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)
    
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.crop_variety.name} - {self.quantity_quintals}Q by {self.farmer.username}"


class Bid(models.Model):
    """
    Buyer's bid on a crop listing.
    """
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        REJECTED = 'REJECTED', 'Rejected'
    
    listing = models.ForeignKey(CropListing, on_delete=models.CASCADE, related_name='bids')
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bids')
    
    amount_per_quintal = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-amount_per_quintal', '-created_at']
        unique_together = ['listing', 'buyer']  # One bid per buyer per listing
    
    def save(self, *args, **kwargs):
        # Auto-calculate total amount
        if self.listing:
            self.total_amount = self.amount_per_quintal * self.listing.quantity_quintals
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Bid ₹{self.amount_per_quintal}/Q on {self.listing.id} by {self.buyer.username}"


class Order(models.Model):
    """
    Created when a bid is accepted. Tracks payment and delivery.
    """
    class PaymentStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        TOKEN_DEPOSITED = 'TOKEN_DEPOSITED', 'Token Deposited (20%)'
        FULL_DEPOSITED = 'FULL_DEPOSITED', 'Full Amount in Escrow'
        RELEASED = 'RELEASED', 'Released to Farmer'
        REFUNDED = 'REFUNDED', 'Refunded'
    
    class OrderStatus(models.TextChoices):
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        PICKUP_SCHEDULED = 'PICKUP_SCHEDULED', 'Pickup Scheduled'
        IN_TRANSIT = 'IN_TRANSIT', 'In Transit'
        DELIVERED = 'DELIVERED', 'Delivered'
        COMPLETED = 'COMPLETED', 'Completed'
        DISPUTED = 'DISPUTED', 'Disputed'
        CANCELLED = 'CANCELLED', 'Cancelled'
    
    listing = models.ForeignKey(CropListing, on_delete=models.PROTECT)
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='purchases')
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='sales')
    bid = models.OneToOneField(Bid, on_delete=models.PROTECT, related_name='order')
    
    final_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    order_status = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.CONFIRMED)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Order #{self.id} - {self.listing.crop_variety.name}"
