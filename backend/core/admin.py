from django.contrib import admin
from .models import Region, CropVariety, QualityParameter


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ['state', 'district']
    list_filter = ['state']
    search_fields = ['state', 'district']


@admin.register(CropVariety)
class CropVarietyAdmin(admin.ModelAdmin):
    list_display = ['name', 'base_price_per_quintal', 'created_at']
    search_fields = ['name', 'description']
    list_filter = ['created_at']


@admin.register(QualityParameter)
class QualityParameterAdmin(admin.ModelAdmin):
    list_display = ['parameter_name', 'acceptable_range']
    search_fields = ['parameter_name']
