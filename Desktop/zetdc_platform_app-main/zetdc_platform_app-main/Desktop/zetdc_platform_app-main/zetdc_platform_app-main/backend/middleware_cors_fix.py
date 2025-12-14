from django.conf import settings
from django.http import HttpResponse
import re


class EnsureCorsHeadersMiddleware:
    """Middleware to ensure CORS headers are present on all responses.

    This is a defensive addition on top of `django-cors-headers`. It will
    respond to preflight `OPTIONS` requests and add `Access-Control-*`
    headers when the request `Origin` matches allowed origins.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def _origin_allowed(self, origin: str) -> bool:
        if not origin:
            return False

        # Support both naming variants
        if getattr(settings, 'CORS_ORIGIN_ALLOW_ALL', False) or getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', False):
            return True

        allowed = getattr(settings, 'CORS_ALLOWED_ORIGINS', []) or []
        if origin in allowed:
            return True

        regexes = getattr(settings, 'CORS_ALLOWED_ORIGIN_REGEXES', []) or []
        for pattern in regexes:
            try:
                if re.match(pattern, origin):
                    return True
            except re.error:
                # ignore invalid regex
                continue

        return False

    def _apply_headers(self, response: HttpResponse, origin: str):
        response['Access-Control-Allow-Origin'] = origin
        response['Vary'] = response.get('Vary', '') + (', Origin' if 'Origin' not in response.get('Vary', '') else '')
        response['Access-Control-Allow-Credentials'] = 'true' if getattr(settings, 'CORS_ALLOW_CREDENTIALS', False) else 'false'
        methods = getattr(settings, 'CORS_ALLOW_METHODS', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'])
        response['Access-Control-Allow-Methods'] = ', '.join(methods)
        # Ensure content-type is always allowed in preflight responses (some clients send it)
        headers = getattr(settings, 'CORS_ALLOW_HEADERS', ['accept', 'authorization', 'content-type', 'x-csrftoken', 'x-requested-with', 'origin'])
        # normalize and ensure 'content-type' present
        lower_headers = [h.lower() for h in headers]
        if 'content-type' not in lower_headers:
            headers = list(headers) + ['content-type']
        response['Access-Control-Allow-Headers'] = ', '.join(headers)
        max_age = getattr(settings, 'CORS_PREFLIGHT_MAX_AGE', None)
        if max_age is not None:
            response['Access-Control-Max-Age'] = str(max_age)

    def __call__(self, request):
        origin = request.META.get('HTTP_ORIGIN')

        # If it's a preflight request, short-circuit with a 200 response
        if request.method == 'OPTIONS':
            response = HttpResponse()
            if self._origin_allowed(origin):
                self._apply_headers(response, origin)
            return response

        response = self.get_response(request)

        # Ensure headers are present for non-OPTIONS responses as well
        if origin and self._origin_allowed(origin):
            self._apply_headers(response, origin)

        return response
