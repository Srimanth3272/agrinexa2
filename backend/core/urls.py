from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegionViewSet, CropVarietyViewSet, QualityParameterViewSet

router = DefaultRouter()
router.register(r'regions', RegionViewSet, basename='region')
router.register(r'crops', CropVarietyViewSet, basename='crop-variety')
router.register(r'quality-parameters', QualityParameterViewSet, basename='quality-parameter')

urlpatterns = [
    path('', include(router.urls)),
]
