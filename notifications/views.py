from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination

from .models import Notification, NotificationSettings
from .serializers import NotificationSerializer, NotificationSettingsSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    pagination_class = PageNumberPagination

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

    @action(detail=False, methods=['delete'])
    def delete_all(self, request):
        """Delete all notifications for the current user."""
        qs = self.get_queryset()
        count = qs.count()
        qs.delete()
        return Response({'status': 'deleted', 'deleted': count})

    @action(detail=True, methods=['post'])
    def mark_unread(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = False
        notification.save()
        return Response({'status': 'marked as unread'})

    @action(detail=False, methods=['get', 'post'], url_path='settings')
    def user_settings(self, request):
        """Get or update the current user's notification settings."""
        try:
            settings_obj, created = NotificationSettings.objects.get_or_create(user=request.user)
        except Exception:
            return Response({'detail': 'Could not get or create settings'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if request.method == 'GET':
            serializer = NotificationSettingsSerializer(settings_obj)
            return Response(serializer.data)

        # POST -> update
        serializer = NotificationSettingsSerializer(settings_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)