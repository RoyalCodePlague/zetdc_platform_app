"""
Custom permission classes for handling CORS preflight requests
"""
from rest_framework import permissions


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
