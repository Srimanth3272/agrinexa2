from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Region, CropVariety, QualityParameter
from .serializers import RegionSerializer, CropVarietySerializer, QualityParameterSerializer


class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    """List all regions (read-only)"""
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filterset_fields = ['state', 'district']
    search_fields = ['state', 'district']


class CropVarietyViewSet(viewsets.ReadOnlyModelViewSet):
    """List all crop varieties (read-only for users)"""
    queryset = CropVariety.objects.all()
    serializer_class = CropVarietySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'base_price_per_quintal']


class QualityParameterViewSet(viewsets.ReadOnlyModelViewSet):
    """List quality parameters (read-only)"""
    queryset = QualityParameter.objects.all()
    serializer_class = QualityParameterSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
