from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import EscrowTransaction
from .serializers import EscrowTransactionSerializer
from market.models import Order


class EscrowTransactionViewSet(viewsets.ModelViewSet):
    """View and create escrow transactions"""
    queryset = EscrowTransaction.objects.all()
    serializer_class = EscrowTransactionSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'transaction_type', 'order']
    ordering_fields = ['created_at']
    
    def get_queryset(self):
        # Users see transactions for their orders only
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.role == 'FARMER':
            return queryset.filter(order__farmer=user)
        elif user.role == 'BUYER':
            return queryset.filter(order__buyer=user)
        return queryset.none()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def initiate_payment(self, request):
        """Initiate a payment for an order"""
        order_id = request.data.get('order_id')
        transaction_type = request.data.get('transaction_type', 'TOKEN')
        
        try:
            order = Order.objects.get(id=order_id, buyer=request.user)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Calculate amount based on transaction type
        if transaction_type == 'TOKEN':
            amount = order.final_amount * 0.20  # 20% token
        else:
            amount = order.final_amount
        
        # Create transaction (mock payment for MVP)
        transaction = EscrowTransaction.objects.create(
            order=order,
            user=request.user,
            transaction_type=transaction_type,
            amount=amount,
            status='SUCCESS',  # Mock success for MVP
            gateway_transaction_id=f'TXN{order.id}{transaction_type}'
        )
        
        # Update order payment status
        if transaction_type == 'TOKEN':
            order.payment_status = 'TOKEN_DEPOSITED'
        elif transaction_type == 'FULL':
            order.payment_status = 'FULL_DEPOSITED'
        order.save()
        
        return Response(
            EscrowTransactionSerializer(transaction).data,
            status=status.HTTP_201_CREATED
        )
