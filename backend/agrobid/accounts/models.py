from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    Adds role-based access and verification status.
    """
    class Role(models.TextChoices):
        FARMER = 'FARMER', 'Farmer'
        BUYER = 'BUYER', 'Buyer'
        ADMIN = 'ADMIN', 'Admin'
    
    phone = models.CharField(max_length=15, unique=True)
    role = models.CharField(max_length=10, choices=Role.choices)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.username} ({self.role})"


class FarmerProfile(models.Model):
    """
    Extended profile for Farmers.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='farmer_profile')
    address = models.TextField()
    state = models.CharField(max_length=50)
    district = models.CharField(max_length=50)
    pincode = models.CharField(max_length=10)
    land_size_acres = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    
    # Verification documents
    aadhar_number = models.CharField(max_length=12, blank=True)
    aadhar_document = models.FileField(upload_to='verification/farmer/aadhar/', null=True, blank=True)
    land_document = models.FileField(upload_to='verification/farmer/land/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Farmer Profile: {self.user.username}"


class BuyerProfile(models.Model):
    """
    Extended profile for Buyers (Rice Mills).
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='buyer_profile')
    company_name = models.CharField(max_length=200)
    address = models.TextField()
    state = models.CharField(max_length=50)
    district = models.CharField(max_length=50)
    pincode = models.CharField(max_length=10)
    
    # Mill capacity
    mill_capacity_tons_per_day = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    
    # Verification documents
    gst_number = models.CharField(max_length=15, unique=True)
    gst_document = models.FileField(upload_to='verification/buyer/gst/', null=True, blank=True)
    business_registration = models.FileField(upload_to='verification/buyer/business/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Buyer Profile: {self.company_name}"
