from rest_framework import serializers
from .models import SupportTicket


class SupportTicketSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = SupportTicket
        fields = [
            'id',
            'user',
            'user_email',
            'user_name',
            'subject',
            'category',
            'message',
            'email',
            'status',
            'created_at',
            'updated_at',
            'resolved_at'
        ]
        read_only_fields = ['id', 'user', 'status', 'created_at', 'updated_at', 'resolved_at']
    
    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
        return None
    
    def create(self, validated_data):
        # Automatically set the user from the request context
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)
