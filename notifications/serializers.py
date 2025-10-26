from rest_framework import serializers
from .models import Notification
from .models import NotificationSettings

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['user', 'created_at']


class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = [
            'email_notifications', 'sms_notifications', 'whatsapp_notifications',
            'low_balance_alerts', 'payment_confirmations', 'promotional_offers', 'system_updates',
            'updated_at'
        ]
        read_only_fields = ['updated_at']