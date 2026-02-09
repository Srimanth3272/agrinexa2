from django.contrib import admin
from .models import Shipment


@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'pickup_date', 'delivery_date', 
                    'driver_name', 'status', 'created_at']
    list_filter = ['status', 'pickup_date', 'delivery_date']
    search_fields = ['order__id', 'driver_name', 'driver_phone', 'vehicle_number']
    list_select_related = ['order']
