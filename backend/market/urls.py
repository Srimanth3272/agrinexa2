from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CropListingViewSet, BidViewSet, OrderViewSet

router = DefaultRouter()
router.register(r'listings', CropListingViewSet, basename='listing')
router.register(r'bids', BidViewSet, basename='bid')
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]
