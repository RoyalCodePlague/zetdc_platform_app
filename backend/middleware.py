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
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Handle OPTIONS requests immediately with 200 OK
        if request.method == 'OPTIONS':
            response = JsonResponse({}, status=200)
        else:
            response = self.get_response(request)
        
        return self.add_cors_headers(request, response)

    def is_allowed_origin(self, origin):
        """Check if the origin is allowed"""
        if not origin:
            return False
        
        # List of allowed origins
        allowed_origins = [
            'https://zetdc-frontend.vercel.app',
            'http://localhost:3000',
            'http://localhost:5173',
        ]
        
        # Check exact match
        if origin in allowed_origins:
            return True
        
        # Check if it's a Vercel preview URL
        vercel_patterns = [
            r'^https://zetdc-frontend-[a-z0-9]+-royalcodeplagues-projects\.vercel\.app$',
            r'^https://zetdc-frontend-.*\.vercel\.app$',
        ]
        
        for pattern in vercel_patterns:
            if re.match(pattern, origin):
                return True
        
        return False

    def add_cors_headers(self, request, response):
        """Add CORS headers to response"""
        # Get the origin from the request
        origin = request.META.get('HTTP_ORIGIN', '')
        
        # Check if the origin is allowed
        if self.is_allowed_origin(origin):
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with, x-xsrf-token'
            response['Access-Control-Max-Age'] = '86400'
        
        return response
