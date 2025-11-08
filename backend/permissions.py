"""
Custom permission and authentication classes for handling CORS preflight requests
"""
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication


class OptionalJWTAuthentication(JWTAuthentication):
    """
    JWT authentication that doesn't fail on OPTIONS requests.
    This allows CORS preflight requests to pass through.
    """
    
    def authenticate(self, request):
        # Skip authentication for OPTIONS requests (CORS preflight)
        if request.method == 'OPTIONS':
            return None
        
        # For all other requests, use standard JWT authentication
        return super().authenticate(request)


class AllowOptionsAuthentication(permissions.BasePermission):
    """
    Custom permission to allow OPTIONS requests (CORS preflight) without authentication.
    All other requests require authentication.
    """
    
    def has_permission(self, request, view):
        # Allow OPTIONS requests without authentication (for CORS preflight)
        if request.method == 'OPTIONS':
            return True
        
        # For all other methods, check if user is authenticated
        return request.user and request.user.is_authenticated
