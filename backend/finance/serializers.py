from rest_framework import serializers
from .models import EscrowTransaction
from market.serializers import OrderSerializer
from accounts.serializers import UserSerializer


class EscrowTransactionSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    order_id = serializers.PrimaryKeyRelatedField(
        queryset=EscrowTransaction.objects.all(),
        source='order',
        write_only=True
    )
    
    class Meta:
        model = EscrowTransaction
        fields = [
            'id', 'order', 'order_id', 'user',
            'transaction_type', 'amount', 'payment_gateway',
            'gateway_transaction_id', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
