from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserRegistrationView, LoginView, UserProfileView,
    FarmerProfileViewSet, BuyerProfileViewSet
)

router = DefaultRouter()
router.register(r'farmers', FarmerProfileViewSet, basename='farmer-profile')
router.register(r'buyers', BuyerProfileViewSet, basename='buyer-profile')

urlpatterns = [
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('', include(router.urls)),
]
