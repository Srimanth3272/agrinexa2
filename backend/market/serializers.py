from rest_framework import serializers
from .models import CropListing, Bid, Order
from core.models import CropVariety
from core.serializers import CropVarietySerializer
from accounts.serializers import UserSerializer


class CropListingSerializer(serializers.ModelSerializer):
    farmer = UserSerializer(read_only=True)
    crop_variety = CropVarietySerializer(read_only=True)
    crop_variety_id = serializers.PrimaryKeyRelatedField(
        queryset=CropVariety.objects.all(),
        source='crop_variety',
        write_only=True
    )
    bids_count = serializers.SerializerMethodField()
    highest_bid = serializers.SerializerMethodField()
    
    class Meta:
        model = CropListing
        fields = [
            'id', 'farmer', 'crop_variety', 'crop_variety_id',
            'quantity_quintals', 'expected_price_per_quintal',
            'location_description', 'district', 'state',
            'moisture_content', 'foreign_matter',
            'image1', 'image2', 'image3',
            'status', 'created_at', 'expires_at', 'updated_at',
            'bids_count', 'highest_bid'
        ]
        read_only_fields = ['id', 'farmer', 'created_at', 'updated_at']
    
    def get_bids_count(self, obj):
        return obj.bids.count()
    
    def get_highest_bid(self, obj):
        highest = obj.bids.order_by('-amount_per_quintal').first()
        return highest.amount_per_quintal if highest else None


class BidSerializer(serializers.ModelSerializer):
    buyer = UserSerializer(read_only=True)
    listing = CropListingSerializer(read_only=True)
    listing_id = serializers.PrimaryKeyRelatedField(
        queryset=CropListing.objects.all(),
        source='listing',
        write_only=True
    )
    
    class Meta:
        model = Bid
        fields = [
            'id', 'listing', 'listing_id', 'buyer',
            'amount_per_quintal', 'total_amount',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'buyer', 'total_amount', 'created_at', 'updated_at']
    
    def validate(self, data):
        listing = data.get('listing')
        if listing and listing.status != 'ACTIVE':
            raise serializers.ValidationError("Cannot bid on inactive listing")
        return data


class OrderSerializer(serializers.ModelSerializer):
    listing = CropListingSerializer(read_only=True)
    buyer = UserSerializer(read_only=True)
    farmer = UserSerializer(read_only=True)
    bid = BidSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'listing', 'buyer', 'farmer', 'bid',
            'final_amount', 'payment_status', 'order_status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
