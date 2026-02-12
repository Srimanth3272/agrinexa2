from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'price-recommendations', views.PriceRecommendationViewSet, basename='price-recommendation')
router.register(r'bid-analyses', views.BidAnalysisViewSet, basename='bid-analysis')
router.register(r'historical-prices', views.HistoricalPriceViewSet, basename='historical-price')
router.register(r'market-intelligence', views.MarketIntelligenceViewSet, basename='market-intelligence')

urlpatterns = [
    # AI Assistant endpoints
    path('price-recommendation/', views.get_price_recommendation, name='ai-price-recommendation'),
    path('analyze-bid/<int:bid_id>/', views.analyze_bid, name='ai-analyze-bid'),
    path('market-insights/', views.get_market_insights, name='ai-market-insights'),
    path('negotiation-tips/<int:listing_id>/', views.get_negotiation_tips, name='ai-negotiation-tips'),
    
    # ViewSets
    path('', include(router.urls)),
]
