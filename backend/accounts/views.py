from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, FarmerProfile, BuyerProfile
from .serializers import (
    UserSerializer, UserRegistrationSerializer,
    FarmerProfileSerializer, BuyerProfileSerializer, LoginSerializer
)


class UserRegistrationView(generics.CreateAPIView):
    """Register a new user (farmer or buyer)"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    """Login user and return JWT tokens"""
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        role = serializer.validated_data['role']
        password = serializer.validated_data['password']
        
        # For buyers, authenticate using GST number
        if role == 'BUYER':
            gst_number = serializer.validated_data.get('gst_number')
            try:
                buyer_profile = BuyerProfile.objects.get(gst_number=gst_number)
                username = buyer_profile.user.username
            except BuyerProfile.DoesNotExist:
                return Response(
                    {'error': 'Invalid GST number or password'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        else:
            # For farmers, use username directly
            username = serializer.validated_data.get('username')
        
        # Authenticate the user
        user = authenticate(username=username, password=password)
        
        if not user:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Verify role matches
        if user.role != role:
            return Response(
                {'error': f'This account is not registered as a {role.lower()}'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update current user profile"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class FarmerProfileViewSet(viewsets.ModelViewSet):
    """CRUD for farmer profiles"""
    queryset = FarmerProfile.objects.all()
    serializer_class = FarmerProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see their own profile
        if self.request.user.role == 'FARMER':
            return self.queryset.filter(user=self.request.user)
        return self.queryset.none()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BuyerProfileViewSet(viewsets.ModelViewSet):
    """CRUD for buyer profiles"""
    queryset = BuyerProfile.objects.all()
    serializer_class = BuyerProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see their own profile
        if self.request.user.role == 'BUYER':
            return self.queryset.filter(user=self.request.user)
        return self.queryset.none()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
