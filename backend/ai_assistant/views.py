from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import PriceRecommendation, BidAnalysis, HistoricalPrice, MarketIntelligence
from .serializers import (
    PriceRecommendationSerializer, BidAnalysisSerializer,
    HistoricalPriceSerializer, MarketIntelligenceSerializer
)
from .services import get_ai_service
from market.models import CropListing, Bid


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_price_recommendation(request):
    """
    Generate AI-powered price recommendation for a crop listing.
    
    POST /api/ai/price-recommendation/?provider=gemini|claude|both
    Body: {
        "crop_variety": "Basmati Rice",
        "quantity_quintals": 50,
        "district": "Amritsar",
        "state": "Punjab",
        "moisture_content": 13.5,
        "foreign_matter": 1.8,
        "base_price": 2100
    }
    """
    try:
        # Get provider from query params (default: None = use settings default)
        provider = request.query_params.get('provider', None)
        ai_service = get_ai_service(provider)
        
        # Get recommendation from AI service
        recommendation_data = ai_service.get_price_recommendation(request.data, provider)
        
        # If listing_id is provided, save the recommendation
        listing_id = request.data.get('listing_id')
        if listing_id:
            try:
                listing = CropListing.objects.get(id=listing_id, farmer=request.user)
                price_rec = PriceRecommendation.objects.create(
                    listing=listing,
                    recommended_min_price=recommendation_data['recommended_min_price'],
                    recommended_max_price=recommendation_data['recommended_max_price'],
                    optimal_price=recommendation_data['optimal_price'],
                    confidence_score=recommendation_data['confidence_score'],
                    reasoning=recommendation_data['reasoning'],
                    market_factors=recommendation_data.get('market_factors', [])
                )
                recommendation_data['id'] = price_rec.id
            except CropListing.DoesNotExist:
                pass  # Just return recommendation without saving
        
        return Response(recommendation_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        # Log the error but return a fallback response
        import traceback
        print(f"AI Recommendation Error: {e}")
        traceback.print_exc()
        
        # Return fallback response
        base_price = request.data.get('base_price', 2040)
        return Response({
            'recommended_min_price': round(base_price * 0.95, 2),
            'optimal_price': base_price,
            'recommended_max_price': round(base_price * 1.10, 2),
            'confidence_score': 0.65,
            'reasoning': 'Using base price analysis. AI service temporarily unavailable.',
            'market_factors': ['Base MSP price', 'Standard market rates'],
            'provider': 'Fallback Mode'
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_bid(request, bid_id):
    """
    Analyze a specific bid with AI assistance.
    
    POST /api/ai/analyze-bid/<bid_id>/?provider=gemini|claude|both
    """
    # Get the bid
    bid = get_object_or_404(Bid, id=bid_id)
    
    # Verify user owns the listing
    if bid.listing.farmer != request.user:
        return Response(
            {'error': 'You can only analyze bids on your own listings'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Check if analysis already exists
    try:
        analysis = BidAnalysis.objects.get(bid=bid)
        serializer = BidAnalysisSerializer(analysis)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except BidAnalysis.DoesNotExist:
        pass
    
    # Generate new analysis
    provider = request.query_params.get('provider', None)
    ai_service = get_ai_service(provider)
    analysis_data = ai_service.analyze_bid(bid_id, provider)
    
    if 'error' in analysis_data:
        return Response(analysis_data, status=status.HTTP_404_NOT_FOUND)
    
    # Save the analysis
    analysis = BidAnalysis.objects.create(
        bid=bid,
        quality_rating=analysis_data['quality_rating'],
        analysis_score=analysis_data['analysis_score'],
        suggested_counter_offer=analysis_data.get('suggested_counter_offer'),
        negotiation_tips=analysis_data['negotiation_tips'],
        strengths=analysis_data['strengths'],
        weaknesses=analysis_data['weaknesses'],
        reasoning=analysis_data['reasoning'],
        recommendation=analysis_data['recommendation']
    )
    
    serializer = BidAnalysisSerializer(analysis)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_market_insights(request):
    """
    Get market intelligence and trends.
    
    GET /api/ai/market-insights/?crop_variety=Basmati Rice&state=Punjab
    """
    crop_variety = request.query_params.get('crop_variety', '')
    state = request.query_params.get('state', '')
    
    if not crop_variety:
        return Response(
            {'error': 'crop_variety parameter is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    ai_service = get_ai_service()
    insights = ai_service.get_market_insights(crop_variety, state)
    
    return Response(insights, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_negotiation_tips(request, listing_id):
    """
    Get AI negotiation tips for all bids on a listing.
    
    GET /api/ai/negotiation-tips/<listing_id>/?provider=gemini|claude|both
    """
    # Get the listing
    listing = get_object_or_404(CropListing, id=listing_id)
    
    # Verify user owns the listing
    if listing.farmer != request.user:
        return Response(
            {'error': 'You can only get tips for your own listings'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get all bids for this listing
    bids = Bid.objects.filter(listing=listing, status='PENDING')
    
    if not bids.exists():
        return Response(
            {'message': 'No pending bids to analyze', 'bids': []},
            status=status.HTTP_200_OK
        )
    
    # Analyze each bid
    provider = request.query_params.get('provider', None)
    ai_service = get_ai_service(provider)
    analyzed_bids = []
    
    for bid in bids:
        # Check if analysis exists
        try:
            analysis = BidAnalysis.objects.get(bid=bid)
        except BidAnalysis.DoesNotExist:
            # Generate new analysis
            analysis_data = ai_service.analyze_bid(bid.id, provider)
            if 'error' not in analysis_data:
                analysis = BidAnalysis.objects.create(
                    bid=bid,
                    quality_rating=analysis_data['quality_rating'],
                    analysis_score=analysis_data['analysis_score'],
                    suggested_counter_offer=analysis_data.get('suggested_counter_offer'),
                    negotiation_tips=analysis_data['negotiation_tips'],
                    strengths=analysis_data['strengths'],
                    weaknesses=analysis_data['weaknesses'],
                    reasoning=analysis_data['reasoning'],
                    recommendation=analysis_data['recommendation']
                )
            else:
                continue
        
        analyzed_bids.append(BidAnalysisSerializer(analysis).data)
    
    # Sort by analysis score (best bids first)
    analyzed_bids.sort(key=lambda x: x['analysis_score'], reverse=True)
    
    return Response({
        'listing_id': listing_id,
        'total_bids': len(analyzed_bids),
        'bids': analyzed_bids
    }, status=status.HTTP_200_OK)


# ViewSets for admin/management access

class PriceRecommendationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing price recommendations."""
    queryset = PriceRecommendation.objects.all()
    serializer_class = PriceRecommendationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Farmers see recommendations for their listings
        if self.request.user.role == 'FARMER':
            return queryset.filter(listing__farmer=self.request.user)
        return queryset.none()


class BidAnalysisViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing bid analyses."""
    queryset = BidAnalysis.objects.all()
    serializer_class = BidAnalysisSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Farmers see analyses for bids on their listings
        if self.request.user.role == 'FARMER':
            return queryset.filter(bid__listing__farmer=self.request.user)
        return queryset.none()


class HistoricalPriceViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing historical price data."""
    queryset = HistoricalPrice.objects.all()
    serializer_class = HistoricalPriceSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['crop_variety', 'state', 'district', 'quality_grade']
    ordering_fields = ['transaction_date', 'price_per_quintal']


class MarketIntelligenceViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing market intelligence."""
    queryset = MarketIntelligence.objects.all()
    serializer_class = MarketIntelligenceSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['crop_variety', 'state', 'price_trend']
    ordering_fields = ['created_at', 'current_avg_price']
