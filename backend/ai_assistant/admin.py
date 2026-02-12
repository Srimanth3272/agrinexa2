from django.contrib import admin
from .models import PriceRecommendation, BidAnalysis, HistoricalPrice, MarketIntelligence


@admin.register(PriceRecommendation)
class PriceRecommendationAdmin(admin.ModelAdmin):
    list_display = ['id', 'listing', 'optimal_price', 'confidence_score', 'created_at']
    list_filter = ['confidence_score', 'created_at']
    search_fields = ['listing__crop_variety__name', 'reasoning']
    readonly_fields = ['created_at']


@admin.register(BidAnalysis)
class BidAnalysisAdmin(admin.ModelAdmin):
    list_display = ['id', 'bid', 'quality_rating', 'analysis_score', 'recommendation', 'created_at']
    list_filter = ['quality_rating', 'recommendation', 'created_at']
    search_fields = ['reasoning']
    readonly_fields = ['created_at']


@admin.register(HistoricalPrice)
class HistoricalPriceAdmin(admin.ModelAdmin):
    list_display = ['id', 'crop_variety', 'state', 'district', 'price_per_quintal', 'quality_grade', 'transaction_date']
    list_filter = ['crop_variety', 'state', 'quality_grade', 'transaction_date']
    search_fields = ['crop_variety__name', 'district', 'state']
    date_hierarchy = 'transaction_date'
    readonly_fields = ['created_at']


@admin.register(MarketIntelligence)
class MarketIntelligenceAdmin(admin.ModelAdmin):
    list_display = ['id', 'crop_variety', 'state', 'current_avg_price', 'price_trend', 'trend_percentage', 'period_start', 'period_end']
    list_filter = ['crop_variety', 'price_trend', 'state']
    search_fields = ['crop_variety__name', 'insights']
    date_hierarchy = 'period_start'
    readonly_fields = ['created_at', 'updated_at']
