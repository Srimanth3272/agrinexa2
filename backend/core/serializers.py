from rest_framework import serializers
from .models import Region, CropVariety, QualityParameter


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ['id', 'state', 'district']


class CropVarietySerializer(serializers.ModelSerializer):
    class Meta:
        model = CropVariety
        fields = [
            'id', 'name', 'description', 'base_price_per_quintal',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class QualityParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = QualityParameter
        fields = ['id', 'parameter_name', 'description', 'acceptable_range']
