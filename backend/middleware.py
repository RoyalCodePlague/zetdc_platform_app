"""
Custom middleware for handling CORS properly
"""
from django.http import HttpResponse, JsonResponse
from django.conf import settings
import re

class CorsMiddleware:
    """
    Middleware to ensure CORS headers are sent on all responses,
    including error responses from authentication failures.
    Supports wildcard patterns for Vercel preview deployments.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
        # Compile regex patterns for allowed origins
        self.allowed_origin_patterns = [
            re.compile(r'^https://zetdc-frontend\.vercel\.app$'),
            re.compile(r'^https://zetdc-frontend-.*\.vercel\.app$'),  # Vercel preview deployments
            re.compile(r'^http://localhost:\d+$'),  # Local development
        ]

    def __call__(self, request):
        # Handle OPTIONS requests immediately with 200 OK
        if request.method == 'OPTIONS':
            response = JsonResponse({}, status=200)
        else:
            response = self.get_response(request)
        
        return self.add_cors_headers(request, response)

    def is_origin_allowed(self, origin):
        """Check if origin matches any allowed pattern"""
        if not origin:
            return False
        
        for pattern in self.allowed_origin_patterns:
            if pattern.match(origin):
                return True
        
        return False

    def add_cors_headers(self, request, response):
        """Add CORS headers to response"""
        # Get the origin from the request
        origin = request.META.get('HTTP_ORIGIN', '')
        
        # Check if the origin is allowed
        if self.is_origin_allowed(origin):
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
        
        # Set CORS headers
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with, x-xsrf-token'
        response['Access-Control-Max-Age'] = '86400'
        
        # Handle preflight requests
        if request.method == 'OPTIONS':
            response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with, x-xsrf-token'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        
        return response
