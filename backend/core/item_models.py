from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class CropCategory(models.Model):
    """
    Main categories of crops (e.g., Cereals, Pulses, Oilseeds, etc.)
    """
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True, help_text="Short code like 'CRL', 'PLS'")
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default='🌾', help_text="Emoji or icon identifier")
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Crop Categories"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.icon} {self.name}"


class CropType(models.Model):
    """
    Specific types within a category (e.g., Paddy, Wheat under Cereals)
    """
    category = models.ForeignKey(CropCategory, on_delete=models.CASCADE, related_name='crop_types')
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True, help_text="e.g., 'PDY', 'WHT'")
    description = models.TextField(blank=True)
    
    # Agricultural details
    growing_season = models.CharField(max_length=100, blank=True, help_text="e.g., 'Kharif', 'Rabi', 'Zaid'")
    avg_yield_per_acre = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Average yield in quintals per acre"
    )
    
    # Pricing
    current_msp = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Minimum Support Price (MSP) per quintal"
    )
    
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category', 'name']
        unique_together = ['category', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.category.name})"


class CropVariety(models.Model):
    """
    Specific varieties of a crop type (e.g., Basmati, Swarna under Paddy)
    """
    crop_type = models.ForeignKey(CropType, on_delete=models.CASCADE, related_name='varieties')
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=30, unique=True, help_text="e.g., 'PDY-BAS', 'PDY-SWR'")
    description = models.TextField(blank=True)
    
    # Characteristics
    grain_type = models.CharField(max_length=50, blank=True, help_text="e.g., 'Long grain', 'Short grain'")
    maturity_days = models.IntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(60), MaxValueValidator(300)],
        help_text="Days to maturity"
    )
    
    # Quality standards
    avg_grain_length = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Average grain length in mm"
    )
    aroma_level = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Aroma level 1-5"
    )
    
    # Pricing
    base_price_per_quintal = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Base/reference price per quintal (100kg)"
    )
    premium_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text="Premium % over base crop type price"
    )
    
    # Market info
    demand_level = models.CharField(
        max_length=20,
        choices=[
            ('HIGH', 'High Demand'),
            ('MEDIUM', 'Medium Demand'),
            ('LOW', 'Low Demand')
        ],
        default='MEDIUM'
    )
    
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False, help_text="Show prominently in listings")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Crop Varieties"
        ordering = ['-is_featured', 'crop_type', 'name']
        unique_together = ['crop_type', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.crop_type.name})"


class QualityGrade(models.Model):
    """
    Quality grades for crops (e.g., Grade A, Grade B, Premium)
    """
    crop_variety = models.ForeignKey(CropVariety, on_delete=models.CASCADE, related_name='quality_grades')
    grade_name = models.CharField(max_length=50, help_text="e.g., 'Premium', 'Grade A', 'Grade B'")
    grade_code = models.CharField(max_length=20)
    
    # Quality criteria
    min_moisture_content = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    max_moisture_content = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    max_foreign_matter = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    min_grain_purity = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Price impact
    price_multiplier = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=1.00,
        help_text="Multiplier for base price (1.0 = 100%, 1.2 = 120%)"
    )
    
    description = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-price_multiplier']
        unique_together = ['crop_variety', 'grade_code']
    
    def __str__(self):
        return f"{self.grade_name} - {self.crop_variety.name}"


class PriceHistory(models.Model):
    """
    Historical price data for each crop variety
    """
    crop_variety = models.ForeignKey(CropVariety, on_delete=models.CASCADE, related_name='price_history')
    
    # Price data
    date = models.DateField()
    min_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Minimum price on this date")
    max_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Maximum price on this date")
    avg_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Average price on this date")
    modal_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Most common price")
    
    # Volume data
    volume_traded = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Total volume traded in quintals"
    )
    
    # Location (optional - can track regional prices)
    state = models.CharField(max_length=50, blank=True)
    district = models.CharField(max_length=50, blank=True)
    market = models.CharField(max_length=100, blank=True, help_text="Market/Mandi name")
    
    # Data source
    source = models.CharField(max_length=100, blank=True, help_text="e.g., 'APMC', 'eNAM', 'Manual'")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date', 'crop_variety']
        unique_together = ['crop_variety', 'date', 'market']
        verbose_name_plural = "Price Histories"
    
    def __str__(self):
        return f"{self.crop_variety.name} - {self.date} - ₹{self.avg_price}"


class SeasonalTrend(models.Model):
    """
    Seasonal price and demand trends for each crop
    """
    crop_variety = models.ForeignKey(CropVariety, on_delete=models.CASCADE, related_name='seasonal_trends')
    
    month = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    
    # Price trends
    avg_price_index = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Price index (100 = baseline)"
    )
    price_volatility = models.CharField(
        max_length=20,
        choices=[
            ('LOW', 'Low Volatility'),
            ('MEDIUM', 'Medium Volatility'),
            ('HIGH', 'High Volatility')
        ],
        default='MEDIUM'
    )
    
    # Supply-demand
    supply_level = models.CharField(
        max_length=20,
        choices=[
            ('SURPLUS', 'Surplus'),
            ('BALANCED', 'Balanced'),
            ('SHORTAGE', 'Shortage')
        ],
        default='BALANCED'
    )
    
    demand_level = models.CharField(
        max_length=20,
        choices=[
            ('HIGH', 'High'),
            ('MEDIUM', 'Medium'),
            ('LOW', 'Low')
        ],
        default='MEDIUM'
    )
    
    notes = models.TextField(blank=True, help_text="Seasonal notes/insights")
    
    class Meta:
        ordering = ['crop_variety', 'month']
        unique_together = ['crop_variety', 'month']
    
    def __str__(self):
        month_names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return f"{self.crop_variety.name} - {month_names[self.month]}"


class ItemSpecification(models.Model):
    """
    Technical specifications and certifications for crop items
    """
    crop_variety = models.ForeignKey(CropVariety, on_delete=models.CASCADE, related_name='specifications')
    
    specification_type = models.CharField(
        max_length=50,
        choices=[
            ('ORGANIC', 'Organic Certification'),
            ('FPO', 'FPO Certified'),
            ('EXPORT', 'Export Quality'),
            ('AGMARK', 'Agmark Certified'),
            ('OTHER', 'Other')
        ]
    )
    
    certification_body = models.CharField(max_length=200, blank=True)
    certification_number = models.CharField(max_length=100, blank=True)
    valid_from = models.DateField(null=True, blank=True)
    valid_until = models.DateField(null=True, blank=True)
    
    specification_details = models.JSONField(
        null=True,
        blank=True,
        help_text="Additional specification details in JSON format"
    )
    
    document = models.FileField(upload_to='specifications/', null=True, blank=True)
    
    is_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.specification_type} - {self.crop_variety.name}"
