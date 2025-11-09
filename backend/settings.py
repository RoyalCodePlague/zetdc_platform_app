"""
Django settings for backend project.
"""

from pathlib import Path
import os
import dj_database_url
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-2%jn*wz)-m67aa_31u0e@g36tvxfvs^1ii4+-^am=@3sya!+65')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')

# ==============================
# ✅ CSRF Trusted Origins
# ==============================
REPLIT_DOMAINS = os.environ.get('REPLIT_DOMAINS', '').split(',')
CSRF_TRUSTED_ORIGINS = [
    'https://zetdcplatformapp-production.up.railway.app',
    'https://zetdc-frontend.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000',
] + [f'https://{domain}' for domain in REPLIT_DOMAINS if domain.strip()]

# ==============================
# Installed Apps
# ==============================
try:
    import importlib
    importlib.import_module('jazzmin')
    _HAS_JAZZMIN = True
except Exception:
    _HAS_JAZZMIN = False

INSTALLED_APPS = []
if _HAS_JAZZMIN:
    INSTALLED_APPS.append('jazzmin')

INSTALLED_APPS += [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',

    # Local apps
    'usersAuth',
    'meters',
    'transactions',
    'notifications',
    'support',
]

WSGI_APPLICATION = 'backend.wsgi.application'


# ==============================
# ✅ Middleware (fixed order)
# ==============================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # must be first
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
# Removed 'backend.middleware.CorsMiddleware' → it was conflicting

# ==============================
# REST Framework & JWT
# ==============================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# ==============================
# ✅ CORS Configuration (fixed)
# ==============================
CORS_ALLOWED_ORIGINS = [
    'https://zetdc-frontend.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5000',
] + [f'https://{domain}' for domain in REPLIT_DOMAINS if domain.strip()]

# Allow wildcard for all Vercel preview subdomains (optional)
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://zetdc-frontend.*\.vercel\.app$",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ['DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT']
CORS_ALLOW_HEADERS = ['*']
CORS_PREFLIGHT_MAX_AGE = 86400
CORS_ORIGIN_ALLOW_ALL = False  # explicit allowed list only

# ==============================
# ✅ Secure Cookies for cross-site
# ==============================
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SECURE = True

# ==============================
# Database
# ==============================
if os.environ.get('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.config(
            default=os.environ.get('DATABASE_URL'),
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# ==============================
# Miscellaneous
# ==============================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'usersAuth.User'

# ==============================
# Jazzmin
# ==============================
JAZZMIN_SETTINGS = {
    "site_title": "ZETDC Platform Admin",
    "site_header": "ZETDC Admin",
    "welcome_sign": "Welcome to ZETDC Management",
    "copyright": "© 2025 ZETDC",
    "order_with_respect_to": ["usersAuth", "meters", "transactions", "notifications", "support"],
    "show_ui_builder": True,
}

JAZZMIN_UI_TWEAKS = {
    "theme": "darkly",
    "dark_mode_theme": "darkly",
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success"
    }
}
