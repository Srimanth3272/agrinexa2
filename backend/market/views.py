from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import CropListing, Bid, Order
from .serializers import CropListingSerializer, BidSerializer, OrderSerializer


class CropListingViewSet(viewsets.ModelViewSet):
    """CRUD for crop listings - Farmers only create, all authenticated users can view"""
    queryset = CropListing.objects.all()
    serializer_class = CropListingSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'state', 'district', 'crop_variety']
    search_fields = ['location_description', 'district', 'state']
    ordering_fields = ['created_at', 'expected_price_per_quintal', 'quantity_quintals']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Farmers see only their listings
        if self.request.user.role == 'FARMER':
            return queryset.filter(farmer=self.request.user)
        # Buyers see all active listings
        elif self.request.user.role == 'BUYER':
            return queryset.filter(status='ACTIVE', expires_at__gte=timezone.now())
        return queryset
    
    def perform_create(self, serializer):
        if self.request.user.role != 'FARMER':
            raise PermissionError("Only farmers can create listings")
        serializer.save(farmer=self.request.user)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a listing"""
        listing = self.get_object()
        if listing.farmer != request.user:
            return Response(
                {'error': 'Only the listing owner can cancel it'},
                status=status.HTTP_403_FORBIDDEN
            )
        listing.status = 'CANCELLED'
        listing.save()
        return Response({'status': 'listing cancelled'})


class BidViewSet(viewsets.ModelViewSet):
    """Buyers create bids, farmers view bids on their listings"""
    queryset = Bid.objects.all()
    serializer_class = BidSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'listing']
    ordering_fields = ['created_at', 'amount_per_quintal']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.role == 'BUYER':
            # Buyers see their own bids
            return queryset.filter(buyer=user)
        elif user.role == 'FARMER':
            # Farmers see bids on their listings
            return queryset.filter(listing__farmer=user)
        return queryset.none()
    
    def perform_create(self, serializer):
        if self.request.user.role != 'BUYER':
            raise PermissionError("Only buyers can create bids")
        serializer.save(buyer=self.request.user)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Farmer accepts a bid and creates an order"""
        bid = self.get_object()
        
        # Check if farmer owns the listing
        if bid.listing.farmer != request.user:
            return Response(
                {'error': 'Only the listing owner can accept bids'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if listing is still active
        if bid.listing.status != 'ACTIVE':
            return Response(
                {'error': 'Listing is not active'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Accept the bid
        bid.status = 'ACCEPTED'
        bid.save()
        
        # Mark listing as sold
        bid.listing.status = 'SOLD'
        bid.listing.save()
        
        # Reject all other bids
        Bid.objects.filter(
            listing=bid.listing
        ).exclude(id=bid.id).update(status='REJECTED')
        
        # Create order
        order = Order.objects.create(
            listing=bid.listing,
            buyer=bid.buyer,
            farmer=bid.listing.farmer,
            bid=bid,
            final_amount=bid.total_amount
        )
        
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """View orders - farmers see sales, buyers see purchases"""
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['payment_status', 'order_status']
    ordering_fields = ['created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.role == 'FARMER':
            return queryset.filter(farmer=user)
        elif user.role == 'BUYER':
            return queryset.filter(buyer=user)
        return queryset.none()
