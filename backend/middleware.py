"""
Custom middleware for handling CORS properly
"""
from django.http import HttpResponse, JsonResponse
from django.conf import settings

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

    def add_cors_headers(self, request, response):
        """Add CORS headers to response"""
        # Get the origin from the request
        origin = request.META.get('HTTP_ORIGIN', '')
        
        # Check if the origin is in the allowed origins or matches Vercel preview pattern
        allowed_origins = [
            'https://zetdc-frontend.vercel.app',
            'http://localhost:3000',
            'http://localhost:5173',
        ]
        
        # Allow Vercel preview deployments (pattern: https://*-royalcodeplagues-projects.vercel.app)
        is_vercel_preview = (
            origin.startswith('https://') and 
            origin.endswith('-royalcodeplagues-projects.vercel.app')
        )
        
        if origin in allowed_origins or is_vercel_preview:
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
