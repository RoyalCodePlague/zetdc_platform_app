# CORS Configuration Fix Documentation

## Problem
The frontend deployed on Vercel (`https://zetdc-frontend.vercel.app`) was being blocked by CORS policy when trying to access the backend API at `https://zetdcplatformapp-production.up.railway.app`.

### Error Message
```
Access to XMLHttpRequest at 'https://zetdcplatformapp-production.up.railway.app/api/users/' 
from origin 'https://zetdc-frontend.vercel.app' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause
1. The backend had `CORS_ORIGIN_ALLOW_ALL = True` which should have worked, but was being overridden
2. The custom CORS middleware wasn't properly handling all Vercel preview URLs
3. Conflicting CORS configurations in settings.py

## Solution

### 1. Updated Django Settings (`backend/settings.py`)
- Added `CORS_ALLOWED_ORIGIN_REGEXES` to match all Vercel preview URLs: `r"^https://.*\.vercel\.app$"`
- Consolidated `CSRF_TRUSTED_ORIGINS` to remove duplicates
- Added wildcard support for Vercel URLs in CSRF trusted origins: `https://*.vercel.app`
- Changed `CORS_ORIGIN_ALLOW_ALL = DEBUG` to only allow all origins in development

### 2. Enhanced Custom CORS Middleware (`backend/middleware.py`)
- Added regex pattern matching for Vercel preview URLs
- Improved `is_origin_allowed()` method to:
  - Check exact matches for known origins
  - Match any Vercel preview URL using regex
  - Allow all origins in DEBUG mode
- Only adds CORS headers if the origin is allowed

### 3. Configuration Details

#### Allowed Origins (Exact Match)
- `https://zetdc-frontend.vercel.app` (Production)
- `https://zetdcplatformapp-production.up.railway.app` (Backend)
- `http://localhost:3000` (Local development)
- `http://localhost:5173` (Local development)

#### Allowed Origins (Regex Pattern)
- `^https://.*\.vercel\.app$` (All Vercel preview deployments)

#### CORS Headers Set
- `Access-Control-Allow-Origin`: The requesting origin (if allowed)
- `Access-Control-Allow-Credentials`: `true`
- `Access-Control-Allow-Methods`: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- `Access-Control-Allow-Headers`: `accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with, x-xsrf-token`
- `Access-Control-Max-Age`: `86400` (24 hours)

## Testing
Run the included test script to verify CORS pattern matching:
```bash
python test_cors_config.py
```

## Deployment
After deploying these changes:
1. The backend will properly respond to CORS preflight requests
2. All Vercel preview URLs will be allowed
3. Production frontend will have full access to the API
4. CORS headers will be present on all responses, including error responses

## Security Notes
- In production (`DEBUG=False`), only explicitly allowed origins will work
- In development (`DEBUG=True`), all origins are allowed for easier testing
- The regex pattern is restrictive to only match `.vercel.app` domains
- Credentials (cookies, auth headers) are allowed for authenticated requests
