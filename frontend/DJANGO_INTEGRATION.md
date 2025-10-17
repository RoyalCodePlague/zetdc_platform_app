# Complete Django + DRF Backend Integration Guide

This comprehensive guide will walk you through integrating your React electricity management frontend with a Django REST Framework (DRF) backend using SQLite database on localhost.

## Table of Contents
1. [Django Backend Setup](#django-backend-setup)
2. [Database Configuration](#database-configuration)
3. [Authentication Setup](#authentication-setup)
4. [API Endpoints](#api-endpoints)
5. [Frontend Integration](#frontend-integration)
6. [CORS Configuration](#cors-configuration)
7. [Deployment](#deployment)

---

## Django Backend Setup

### 1. Create Django Project

```bash
# Create a new directory for your backend
mkdir electricity-backend
cd electricity-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Django and DRF
pip install django djangorestframework
pip install django-cors-headers
pip install djangorestframework-simplejwt
pip install python-decouple
pip install psycopg2-binary  # For PostgreSQL

# Create Django project
django-admin startproject backend .

# Create apps
python manage.py startapp users
python manage.py startapp meters
python manage.py startapp transactions
python manage.py startapp notifications
```

### 2. Update `settings.py`

```python
# backend/settings.py

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    
    # Local apps
    'users',
    'meters',
    'transactions',
    'notifications',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be at the top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# REST Framework Configuration
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

# JWT Configuration
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",
    "https://yourdomain.com",  # Production domain
]

CORS_ALLOW_CREDENTIALS = True
```

---

## Database Configuration

### 1. Define Models

#### `users/models.py`
```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    phone_number = models.CharField(max_length=15, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    two_factor_enabled = models.BooleanField(default=False)
    preferred_language = models.CharField(max_length=10, default='en')
    timezone = models.CharField(max_length=50, default='UTC')
    
    def __str__(self):
        return self.email

class UserRole(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('user', 'User'),
        ('moderator', 'Moderator'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='roles')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    
    class Meta:
        unique_together = ('user', 'role')

class PaymentMethod(models.Model):
    PAYMENT_TYPE_CHOICES = [
        ('card', 'Card'),
        ('mobile_money', 'Mobile Money'),
        ('bank', 'Bank Account'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_methods')
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES)
    last_four = models.CharField(max_length=4)
    is_default = models.BooleanField(default=False)
    provider = models.CharField(max_length=50)  # Visa, Mastercard, EcoCash, etc.
    created_at = models.DateTimeField(auto_now_add=True)
```

#### `meters/models.py`
```python
from django.db import models
from users.models import User

class Meter(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meters')
    meter_number = models.CharField(max_length=50, unique=True)
    nickname = models.CharField(max_length=100, blank=True)
    address = models.TextField()
    is_primary = models.BooleanField(default=False)
    auto_recharge_enabled = models.BooleanField(default=False)
    auto_recharge_threshold = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    auto_recharge_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    current_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.meter_number} - {self.user.email}"

class Token(models.Model):
    meter = models.ForeignKey(Meter, on_delete=models.CASCADE, related_name='tokens')
    token_code = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    units = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.token_code} - {self.meter.meter_number}"
```

#### `transactions/models.py`
```python
from django.db import models
from users.models import User
from meters.models import Meter

class Transaction(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    TRANSACTION_TYPE_CHOICES = [
        ('purchase', 'Purchase'),
        ('recharge', 'Recharge'),
        ('refund', 'Refund'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    meter = models.ForeignKey(Meter, on_delete=models.SET_NULL, null=True, related_name='transactions')
    transaction_id = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    payment_method = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.transaction_id} - {self.amount}"
```

#### `notifications/models.py`
```python
from django.db import models
from users.models import User

class Notification(models.Model):
    TYPE_CHOICES = [
        ('purchase', 'Purchase'),
        ('payment', 'Payment'),
        ('system', 'System'),
        ('alert', 'Alert'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.email}"
```

### 2. Update `settings.py` for Custom User Model

```python
# backend/settings.py

AUTH_USER_MODEL = 'users.User'
```

### 3. Create and Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## Authentication Setup

### 1. Create Serializers

#### `users/serializers.py`
```python
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 
                  'phone_number', 'profile_picture', 'two_factor_enabled',
                  'preferred_language', 'timezone']
        read_only_fields = ['id']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password_confirm', 
                  'first_name', 'last_name', 'phone_number']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['username'] = user.username
        return token
```

### 2. Create Views

#### `users/views.py`
```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer
)

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        return UserSerializer
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'])
    def update_profile(self, request):
        serializer = self.get_serializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
```

### 3. Configure URLs

#### `users/urls.py`
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import UserViewSet, CustomTokenObtainPairView

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
```

#### `backend/urls.py`
```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/', include('meters.urls')),
    path('api/', include('transactions.urls')),
    path('api/', include('notifications.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

---

## API Endpoints

### Complete API Structure

#### Meters API (`meters/views.py` & `meters/urls.py`)

```python
# meters/serializers.py
from rest_framework import serializers
from .models import Meter, Token

class MeterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meter
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']

class TokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Token
        fields = '__all__'
        read_only_fields = ['created_at', 'used_at']

# meters/views.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Meter, Token
from .serializers import MeterSerializer, TokenSerializer

class MeterViewSet(viewsets.ModelViewSet):
    serializer_class = MeterSerializer
    
    def get_queryset(self):
        return Meter.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def purchase_electricity(self, request, pk=None):
        meter = self.get_object()
        amount = request.data.get('amount')
        # Implement electricity purchase logic
        return Response({'status': 'success', 'token': '1234-5678-9012-3456'})
    
    @action(detail=True, methods=['post'])
    def recharge_token(self, request, pk=None):
        meter = self.get_object()
        token_code = request.data.get('token')
        # Implement token recharge logic
        return Response({'status': 'success'})

class TokenViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TokenSerializer
    
    def get_queryset(self):
        return Token.objects.filter(meter__user=self.request.user)

# meters/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MeterViewSet, TokenViewSet

router = DefaultRouter()
router.register(r'meters', MeterViewSet, basename='meter')
router.register(r'tokens', TokenViewSet, basename='token')

urlpatterns = [
    path('', include(router.urls)),
]
```

#### Transactions API

```python
# transactions/serializers.py
from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['user', 'transaction_id', 'created_at', 'updated_at']

# transactions/views.py
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Transaction
from .serializers import TransactionSerializer

class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TransactionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'transaction_type']
    search_fields = ['transaction_id', 'description']
    ordering_fields = ['created_at', 'amount']
    
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

# transactions/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
]
```

#### Notifications API

```python
# notifications/serializers.py
from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

# notifications/views.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'status': 'all marked as read'})

# notifications/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]
```

---

## Frontend Integration

### 1. Create API Service Layer

Create `src/services/api.ts`:

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### 2. Create Auth Service

Create `src/services/auth.ts`:

```typescript
import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login/', credentials);
    const { access, refresh } = response.data;
    
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    return response.data;
  },

  async register(data: RegisterData) {
    const response = await api.post('/users/', data);
    return response.data;
  },

  async logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  async getCurrentUser() {
    const response = await api.get('/users/me/');
    return response.data;
  },

  async updateProfile(data: Partial<RegisterData>) {
    const response = await api.patch('/users/update_profile/', data);
    return response.data;
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },
};
```

### 3. Create Other Services

Create `src/services/meters.ts`:

```typescript
import api from './api';

export const metersService = {
  async getMeters() {
    const response = await api.get('/meters/');
    return response.data;
  },

  async getMeter(id: string) {
    const response = await api.get(`/meters/${id}/`);
    return response.data;
  },

  async createMeter(data: any) {
    const response = await api.post('/meters/', data);
    return response.data;
  },

  async updateMeter(id: string, data: any) {
    const response = await api.patch(`/meters/${id}/`, data);
    return response.data;
  },

  async deleteMeter(id: string) {
    const response = await api.delete(`/meters/${id}/`);
    return response.data;
  },

  async purchaseElectricity(meterId: string, amount: number) {
    const response = await api.post(`/meters/${meterId}/purchase_electricity/`, {
      amount,
    });
    return response.data;
  },

  async rechargeToken(meterId: string, token: string) {
    const response = await api.post(`/meters/${meterId}/recharge_token/`, {
      token,
    });
    return response.data;
  },
};
```

Create `src/services/transactions.ts`:

```typescript
import api from './api';

export const transactionsService = {
  async getTransactions(params?: any) {
    const response = await api.get('/transactions/', { params });
    return response.data;
  },

  async getTransaction(id: string) {
    const response = await api.get(`/transactions/${id}/`);
    return response.data;
  },
};
```

Create `src/services/notifications.ts`:

```typescript
import api from './api';

export const notificationsService = {
  async getNotifications() {
    const response = await api.get('/notifications/');
    return response.data;
  },

  async markAsRead(id: string) {
    const response = await api.post(`/notifications/${id}/mark_read/`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.post('/notifications/mark_all_read/');
    return response.data;
  },

  async deleteNotification(id: string) {
    const response = await api.delete(`/notifications/${id}/`);
    return response.data;
  },
};
```

### 4. Update Environment Variables

Create `.env.local` in your React project root:

```env
VITE_API_URL=http://localhost:8000/api
```

For production:
```env
VITE_API_URL=https://your-backend-domain.com/api
```

### 5. Update Authentication Modal

Update `src/components/modals/AuthModal.tsx` to use the API:

```typescript
import { authService } from '@/services/auth';

// In handleSubmit function:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    if (activeTab === 'login') {
      await authService.login({
        email: formData.email,
        password: formData.password,
      });
      
      toast({
        title: "Login successful!",
        description: "Welcome back!",
      });
      
      onOpenChange(false);
      window.location.href = '/dashboard';
    } else {
      await authService.register({
        email: formData.email,
        username: formData.email.split('@')[0],
        password: formData.password,
        password_confirm: formData.confirmPassword,
        first_name: formData.fullName.split(' ')[0],
        last_name: formData.fullName.split(' ')[1] || '',
        phone_number: formData.phoneNumber,
      });
      
      toast({
        title: "Registration successful!",
        description: "Please login with your credentials.",
      });
      
      setActiveTab('login');
    }
  } catch (error: any) {
    toast({
      variant: "destructive",
      title: "Error",
      description: error.response?.data?.message || "An error occurred",
    });
  }
};
```

---

## CORS Configuration

### Development CORS Settings

```python
# backend/settings.py

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

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
```

### Production CORS Settings

```python
# For production, use environment variables
from decouple import config

CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='').split(',')
```

---

## Deployment

### Backend Deployment (Django)

#### 1. Prepare for Production

```python
# backend/settings.py

import os
from decouple import config

DEBUG = config('DEBUG', default=False, cast=bool)
SECRET_KEY = config('SECRET_KEY')

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='').split(',')

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

#### 2. Create `requirements.txt`

```bash
pip freeze > requirements.txt
```

#### 3. Deploy to Platform (e.g., Heroku, Railway, DigitalOcean)

**For Heroku:**
```bash
# Install Heroku CLI
heroku login
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set SECRET_KEY="your-secret-key"
heroku config:set DEBUG=False

# Deploy
git push heroku main
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
```

**For Railway:**
1. Connect your GitHub repository
2. Add environment variables in dashboard
3. Railway auto-deploys on push

### Frontend Deployment

Update `.env.production`:
```env
VITE_API_URL=https://your-backend-domain.com/api
```

The frontend is already configured for deployment on Lovable's platform.

---

## Testing the Integration

### 1. Start Django Backend

```bash
cd electricity-backend
python manage.py runserver
```

### 2. Start React Frontend

```bash
npm run dev
```

### 3. Test Authentication Flow

1. Register a new user
2. Login with credentials
3. Check if JWT tokens are stored in localStorage
4. Navigate to dashboard
5. Test API calls (meters, transactions, notifications)

### 4. Check API Endpoints

Visit `http://localhost:8000/api/` to see available endpoints.

---

## Security Best Practices

1. **Always use HTTPS in production**
2. **Store sensitive data in environment variables**
3. **Implement rate limiting** (use django-ratelimit)
4. **Add input validation** on both frontend and backend
5. **Use parameterized queries** (Django ORM does this by default)
6. **Implement proper permission classes** for different user roles
7. **Keep dependencies updated**
8. **Use strong SECRET_KEY**
9. **Enable CSRF protection** for non-API views
10. **Implement logging and monitoring**

---

## Additional Resources

- [Django REST Framework Documentation](https://www.django-rest-framework.org/)
- [Django Documentation](https://docs.djangoproject.com/)
- [JWT Authentication Guide](https://django-rest-framework-simplejwt.readthedocs.io/)
- [Django CORS Headers](https://github.com/adamchainz/django-cors-headers)

---

## Support

For issues or questions:
1. Check Django logs: `python manage.py runserver --verbosity 2`
2. Check browser console for frontend errors
3. Check network tab for API response errors
4. Review Django REST Framework browsable API at `http://localhost:8000/api/`

---

*Last updated: 2025-10-07*
