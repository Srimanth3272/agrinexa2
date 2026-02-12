from rest_framework import serializers
from .models import PriceRecommendation, BidAnalysis, HistoricalPrice, MarketIntelligence


class PriceRecommendationSerializer(serializers.ModelSerializer):
    """Serializer for AI price recommendations."""
    
    class Meta:
        model = PriceRecommendation
        fields = [
            'id', 'listing', 'recommended_min_price', 'recommended_max_price',
            'optimal_price', 'confidence_score', 'reasoning', 'market_factors',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class BidAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for AI bid analysis."""
    
    bid_amount = serializers.DecimalField(source='bid.amount_per_quintal', max_digits=10, decimal_places=2, read_only=True)
    buyer_name = serializers.CharField(source='bid.buyer.username', read_only=True)
    
    class Meta:
        model = BidAnalysis
        fields = [
            'id', 'bid', 'bid_amount', 'buyer_name', 'quality_rating',
            'analysis_score', 'suggested_counter_offer', 'negotiation_tips',
            'strengths', 'weaknesses', 'reasoning', 'recommendation', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class HistoricalPriceSerializer(serializers.ModelSerializer):
    """Serializer for historical price data."""
    
    crop_variety_name = serializers.CharField(source='crop_variety.name', read_only=True)
    
    class Meta:
        model = HistoricalPrice
        fields = [
            'id', 'crop_variety', 'crop_variety_name', 'district', 'state',
            'price_per_quintal', 'quantity_quintals', 'quality_grade',
            'moisture_content', 'foreign_matter', 'transaction_date', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class MarketIntelligenceSerializer(serializers.ModelSerializer):
    """Serializer for market intelligence data."""
    
    crop_variety_name = serializers.CharField(source='crop_variety.name', read_only=True)
    
    class Meta:
        model = MarketIntelligence
        fields = [
            'id', 'crop_variety', 'crop_variety_name', 'state',
            'current_avg_price', 'price_trend', 'trend_percentage',
            'insights', 'recommendations', 'period_start', 'period_end',
            'data_points_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
