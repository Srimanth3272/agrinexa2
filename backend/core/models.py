from django.db import models


class Region(models.Model):
    """
    Geographic regions (State, District).
    """
    state = models.CharField(max_length=50)
    district = models.CharField(max_length=50)
    
    class Meta:
        unique_together = ['state', 'district']
    
    def __str__(self):
        return f"{self.district}, {self.state}"


class CropVariety(models.Model):
    """
    Different varieties of Paddy rice.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    base_price_per_quintal = models.DecimalField(max_digits=10, decimal_places=2, help_text="Base/MSP price per quintal (100kg)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Crop Varieties"
    
    def __str__(self):
        return self.name


class QualityParameter(models.Model):
    """
    Quality parameters for grading paddy.
    """
    parameter_name = models.CharField(max_length=100)
    description = models.TextField()
    acceptable_range = models.CharField(max_length=100, help_text="e.g., 'Below 14%' for moisture")
    
    def __str__(self):
        return self.parameter_name
