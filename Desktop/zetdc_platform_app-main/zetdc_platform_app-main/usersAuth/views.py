from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.utils import timezone

from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    ChangePasswordSerializer,
)

User = get_user_model()


# 🔹 JWT Login View
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# 🔹 Users CRUD + Profile
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'list', 'retrieve']:
            return [AllowAny()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        return UserSerializer

    # ✅ Prevent duplicate email or meter number
    def create(self, request, *args, **kwargs):
        email = request.data.get("email")
        meter_number = request.data.get("meter_number")

        if User.objects.filter(email=email).exists():
            return Response(
                {"detail": "Email is already registered."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(meter_number=meter_number).exists():
            return Response(
                {"detail": "Meter number is already registered."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'])
    def update_profile(self, request):
        serializer = self.get_serializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password updated successfully"})

    # Sessions and devices (JWT-based placeholders)
    @action(detail=False, methods=['get'])
    def sessions(self, request):
        """Return a simple list of current device/session entries.

        With JWT, server doesn't track sessions, so we return a synthetic entry
        for the current client using User-Agent and IP info if available.
        """
        ua = request.META.get('HTTP_USER_AGENT', '')
        ip = request.META.get('REMOTE_ADDR', '')
        return Response([
            {
                'id': 'current',
                'device': ua or 'Unknown',
                'ip': ip,
                'last_active': timezone.now().isoformat(),
            }
        ])

    @action(detail=False, methods=['post'])
    def logout_session(self, request):
        """Placeholder for logging out a session. For JWT, do nothing server-side."""
        return Response({ 'detail': 'Logged out session (client should drop tokens).' })

    @action(detail=False, methods=['post'])
    def logout_all(self, request):
        """Placeholder for logging out all sessions. For JWT, instruct client to drop tokens."""
        return Response({ 'detail': 'Logged out all sessions (client should drop tokens).' })

    # Privacy actions
    @action(detail=False, methods=['post'])
    def export_data(self, request):
        from .models import DataExportRequest
        from django.utils import timezone
        from datetime import timedelta
        
        # Create export request
        export_request = DataExportRequest.objects.create(
            user=request.user,
            status='pending',
            expires_at=timezone.now() + timedelta(days=7)
        )
        
        return Response({ 
            'detail': 'Export request created. You will receive an email when ready.',
            'request_id': export_request.id
        })

    @action(detail=False, methods=['post'])
    def delete_account(self, request):
        from .models import AccountDeletionRequest
        
        confirm = request.data.get('confirm')
        reason = request.data.get('reason', '')
        
        if not confirm:
            return Response({ 'detail': 'Confirmation required.' }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create deletion request instead of immediately deleting
        deletion_request = AccountDeletionRequest.objects.create(
            user=request.user,
            reason=reason,
            status='pending'
        )
        
        return Response({ 
            'detail': 'Account deletion request submitted. We will review and process your request within 24-48 hours.',
            'request_id': deletion_request.id
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get user statistics for the account overview."""
        from django.db.models import Sum, Count
        from transactions.models import Transaction
        from meters.models import Meter, Token
        
        user = request.user
        
        # Total spent from completed transactions
        total_spent = Transaction.objects.filter(
            user=user, 
            status='completed'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Meters managed
        meters_count = Meter.objects.filter(user=user).count()
        
        # Tokens purchased (from completed transactions)
        tokens_count = Transaction.objects.filter(
            user=user,
            status='completed',
            transaction_type='purchase'
        ).count()
        
        # Member since
        member_since = user.date_joined.strftime('%B %Y')
        
        return Response({
            'total_spent': float(total_spent),
            'meters_managed': meters_count,
            'tokens_purchased': tokens_count,
            'member_since': member_since
        })

    @action(detail=False, methods=['get'])
    def activity(self, request):
        """Get recent user activity."""
        from transactions.models import Transaction
        from django.db.models import Q
        
        # Get recent transactions and other activities
        recent_transactions = Transaction.objects.filter(
            user=request.user
        ).order_by('-created_at')[:10]
        
        activities = []
        for tx in recent_transactions:
            activities.append({
                'action': f'{tx.get_transaction_type_display()} - ${tx.amount}',
                'device': 'Web App',
                'location': 'Unknown',
                'time': tx.created_at.strftime('%b %d, %Y at %I:%M %p'),
                'status': tx.status,
                'type': 'transaction'
            })
        
        return Response(activities)


# 🔹 Verify Token API (Optional)
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_token(request):
    token = request.data.get('token')
    try:
        AccessToken(token)
        return Response({'valid': True}, status=status.HTTP_200_OK)
    except Exception:
        return Response({'valid': False}, status=status.HTTP_401_UNAUTHORIZED)
