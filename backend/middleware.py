"""
Custom middleware for handling CORS properly
"""


class CorsMiddleware:
    """
    Middleware to ensure CORS headers are sent on all responses,
    including error responses from authentication failures.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Handle OPTIONS requests immediately
        if request.method == 'OPTIONS':
            response = self.get_response(request)
            return self.add_cors_headers(request, response)
        
        response = self.get_response(request)
        return self.add_cors_headers(request, response)

    def add_cors_headers(self, request, response):
        """Add CORS headers to response"""
        origin = request.META.get('HTTP_ORIGIN', '*')
        
        # Allow all origins (as configured in settings.CORS_ALLOW_ALL_ORIGINS)
        response['Access-Control-Allow-Origin'] = origin
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with'
        response['Access-Control-Max-Age'] = '86400'
        
        return response
