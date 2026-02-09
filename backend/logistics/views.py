from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Shipment
from .serializers import ShipmentSerializer
from market.models import Order


class ShipmentViewSet(viewsets.ModelViewSet):
    """View and manage shipments"""
    queryset = Shipment.objects.all()
    serializer_class = ShipmentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'order']
    ordering_fields = ['created_at', 'pickup_date']
    
    def get_queryset(self):
        # Users see shipments for their orders only
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.role == 'FARMER':
            return queryset.filter(order__farmer=user)
        elif user.role == 'BUYER':
            return queryset.filter(order__buyer=user)
        return queryset.none()
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update shipment status"""
        shipment = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Shipment.Status.choices):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        shipment.status = new_status
        shipment.save()
        
        # Update order status accordingly
        order = shipment.order
        if new_status == 'IN_TRANSIT':
            order.order_status = 'IN_TRANSIT'
        elif new_status == 'DELIVERED':
            order.order_status = 'DELIVERED'
        order.save()
        
        return Response(ShipmentSerializer(shipment).data)
