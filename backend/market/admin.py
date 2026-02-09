from django.contrib import admin
from .models import CropListing, Bid, Order


@admin.register(CropListing)
class CropListingAdmin(admin.ModelAdmin):
    list_display = ['id', 'farmer', 'crop_variety', 'quantity_quintals', 
                    'expected_price_per_quintal', 'status', 'created_at']
    list_filter = ['status', 'state', 'district', 'crop_variety']
    search_fields = ['farmer__username', 'location_description']
    list_select_related = ['farmer', 'crop_variety']


@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ['id', 'listing', 'buyer', 'amount_per_quintal', 
                    'total_amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['buyer__username', 'listing__id']
    list_select_related = ['buyer', 'listing']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'listing', 'buyer', 'farmer', 'final_amount', 
                    'payment_status', 'order_status', 'created_at']
    list_filter = ['payment_status', 'order_status', 'created_at']
    search_fields = ['buyer__username', 'farmer__username']
    list_select_related = ['buyer', 'farmer', 'listing']
