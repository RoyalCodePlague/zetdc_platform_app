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
            response = HttpResponse(status=200)
        else:
            try:
                response = self.get_response(request)
            except Exception as e:
                # Catch any unhandled exceptions and return a safe response with CORS headers
                response = JsonResponse({'error': 'Internal Server Error'}, status=500)
        
        return self.add_cors_headers(request, response)

    def add_cors_headers(self, request, response):
        """Add CORS headers to response"""
        # Get the origin from the request
        origin = request.META.get('HTTP_ORIGIN', '')
        
        # Check if the origin is in the allowed origins
        allowed_origins = [
            'https://zetdc-frontend.vercel.app',
            'https://zetdc-frontend-k15nifp0m-royalcodeplagues-projects.vercel.app',
            'http://localhost:3000',
            'http://localhost:5173',
            'https://zetdcplatformapp-production.up.railway.app',
        ]
        
        # Always set CORS headers if origin matches
        if origin in allowed_origins:
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
        
        # Set common CORS headers on all responses
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD'
        response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with, x-xsrf-token'
        response['Access-Control-Expose-Headers'] = 'authorization, content-type'
        response['Access-Control-Max-Age'] = '86400'
        
        return response
