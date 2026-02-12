from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from decimal import Decimal
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
            amount = order.final_amount * Decimal('0.20')  # 20% token
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def finance_dashboard(request):
    """Get finance dashboard statistics for the logged-in user"""
    user = request.user
    
    if user.role == 'FARMER':
        # Farmer's earnings
        transactions = EscrowTransaction.objects.filter(
            order__farmer=user,
            transaction_type='RELEASE',
            status='SUCCESS'
        )
        
        total_earnings = transactions.aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        
        pending_releases = EscrowTransaction.objects.filter(
            order__farmer=user,
            transaction_type__in=['TOKEN', 'FULL'],
            status='SUCCESS'
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        total_transactions = transactions.count()
        
        # Recent transactions
        recent = transactions.order_by('-created_at')[:10]
        
        return Response({
            'role': 'FARMER',
            'total_earnings': float(total_earnings),
            'pending_releases': float(pending_releases),
            'total_transactions': total_transactions,
            'recent_transactions': EscrowTransactionSerializer(recent, many=True).data
        })
    
    elif user.role == 'BUYER':
        # Buyer's payments
        transactions = EscrowTransaction.objects.filter(
            order__buyer=user,
            status='SUCCESS'
        )
        
        total_paid = transactions.aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        
        token_payments = transactions.filter(
            transaction_type='TOKEN'
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        full_payments = transactions.filter(
            transaction_type='FULL'
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        total_transactions = transactions.count()
        
        # Recent transactions
        recent = transactions.order_by('-created_at')[:10]
        
        return Response({
            'role': 'BUYER',
            'total_paid': float(total_paid),
            'token_payments': float(token_payments),
            'full_payments': float(full_payments),
            'total_transactions': total_transactions,
            'recent_transactions': EscrowTransactionSerializer(recent, many=True).data
        })
    
    return Response({'error': 'Invalid user role'}, status=status.HTTP_400_BAD_REQUEST)
