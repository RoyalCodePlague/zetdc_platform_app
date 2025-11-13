"""
Custom exception handler to ensure CORS headers are sent on error responses
"""
from rest_framework.views import exception_handler as drf_exception_handler


def custom_exception_handler(exc, context):
    """
    Custom exception handler that ensures CORS headers are sent
    even when exceptions occur (like authentication failures)
    """
    # Call REST framework's default exception handler first
    response = drf_exception_handler(exc, context)
    
    if response is not None:
        # Add CORS headers to error responses
        request = context.get('request')
        if request:
            origin = request.META.get('HTTP_ORIGIN', '*')
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with'
    
    return response
