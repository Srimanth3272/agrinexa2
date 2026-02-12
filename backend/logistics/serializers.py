from rest_framework import serializers
from .models import Shipment
from market.serializers import OrderSerializer
from market.models import Order


class ShipmentSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)
    order_id = serializers.PrimaryKeyRelatedField(
        queryset=Order.objects.all(),
        source='order',
        write_only=True
    )
    
    class Meta:
        model = Shipment
        fields = [
            'id', 'order', 'order_id',
            'pickup_date', 'delivery_date',
            'driver_name', 'driver_phone', 'vehicle_number',
            'status', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
