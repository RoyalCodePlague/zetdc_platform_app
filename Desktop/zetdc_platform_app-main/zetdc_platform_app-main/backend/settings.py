"""
Django settings for backend project (ZETDC Platform)
"""

from pathlib import Path
import os
import dj_database_url
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# ==============================
# ✅ Security Settings
# ==============================
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-placeholder-key')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1,zetdcplatformapp-production.up.railway.app').split(',')

# ==============================
# ✅ CSRF Trusted Origins
# ==============================
CSRF_TRUSTED_ORIGINS = [
    'https://zetdc-frontend.vercel.app',
    'https://zetdcplatformapp-production.up.railway.app',
    'http://localhost:5173',
    'http://localhost:3000',
]

# ==============================
# ✅ Installed Apps
# ==============================
INSTALLED_APPS = [
    # UI (Optional)
    'jazzmin',

    # Django default
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
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

# ==============================
# ✅ Middleware (CORS First!)
# ==============================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be at the top
    'backend.middleware_disabled.CorsMiddleware',  # Fallback to ensure headers on error responses
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'
WSGI_APPLICATION = 'backend.wsgi.application'

# ==============================
# ✅ Templates
# ==============================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ==============================
# ✅ Database
# ==============================
if os.environ.get('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.config(
            default=os.environ['DATABASE_URL'],
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
# ✅ CORS & CSRF Config
# ==============================
CORS_ALLOWED_ORIGINS = [
    'https://zetdc-frontend.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://zetdcplatformapp-production.up.railway.app',
]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://zetdc-frontend.*\.vercel\.app$",
    r"^https://zetdcplatformapp-production\.up\.railway\.app$",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
CORS_EXPOSE_HEADERS = [
    'authorization',
    'content-type',
]
CORS_ALLOW_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']
CORS_PREFLIGHT_MAX_AGE = 86400
CORS_ORIGIN_ALLOW_ALL = False
CORS_ALLOW_ALL_ORIGINS = False

# ==============================
# ✅ Secure Cookies for Cross-site
# ==============================
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SECURE = True

# ==============================
# ✅ REST Framework & JWT
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
# ✅ Static & Media Files
# ==============================
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# ==============================
# ✅ Miscellaneous
# ==============================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==============================
# ✅ Custom User
# ==============================
AUTH_USER_MODEL = 'usersAuth.User'

# ==============================
# ✅ Jazzmin Settings (Optional)
# ==============================
JAZZMIN_SETTINGS = {
    "site_title": "ZETDC Platform Admin",
    "site_header": "ZETDC Admin",
    "welcome_sign": "Welcome to ZETDC Management",
    "copyright": "© 2025 ZETDC",
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
