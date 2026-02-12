from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EscrowTransactionViewSet, finance_dashboard

router = DefaultRouter()
router.register(r'transactions', EscrowTransactionViewSet, basename='transaction')

urlpatterns = [
    path('finance/dashboard/', finance_dashboard, name='finance-dashboard'),
    path('finance/', include(router.urls)),
]
