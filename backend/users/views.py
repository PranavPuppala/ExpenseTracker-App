from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    RegisterSerializer,
    EmailTokenObtainPairSerializer,
    ProfileSerializer,
    PasswordChangeSerializer,
)


# ─────────────────────────────
# Registration - FIXED VERSION
# ─────────────────────────────
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens for the new user
        refresh = RefreshToken.for_user(user)
        
        # Return the same format your frontend expects
        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


# ─────────────────────────────
# Login (email-based)
# ─────────────────────────────
class LoginView(generics.GenericAPIView):
    serializer_class = EmailTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        from django.contrib.auth import authenticate
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        email = request.data.get('email')
        password = request.data.get('password')
        
        try:
            # Find user by email
            user = User.objects.get(email=email)
            
            # Check password
            if user.check_password(password):
                # Generate tokens
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                    },
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {'detail': 'Invalid credentials'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
                
        except User.DoesNotExist:
            return Response(
                {'detail': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )


# Keep your other views the same:

# ─────────────────────────────
# Token refresh
# ─────────────────────────────
class RefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]


# ─────────────────────────────
# Logout – blacklist refresh token
# ─────────────────────────────
class LogoutView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        RefreshToken(request.data["refresh"]).blacklist()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────
# Profile (GET / PUT)
# ─────────────────────────────
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ─────────────────────────────
# Change password 
# ─────────────────────────────
class PasswordChangeView(generics.UpdateAPIView):
    serializer_class = PasswordChangeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

