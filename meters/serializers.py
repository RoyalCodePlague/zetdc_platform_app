from rest_framework import serializers
from .models import Meter, Token
from .models import ManualRecharge
from .models import AutoRechargeConfig, AutoRechargeEvent
from datetime import time

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


class ManualRechargeSerializer(serializers.ModelSerializer):
    meter_nickname = serializers.CharField(source='meter.nickname', read_only=True)
    meter_number = serializers.CharField(source='meter.meter_number', read_only=True)

    class Meta:
        model = ManualRecharge
        # expose only relevant fields to avoid leaking internal ids
        fields = [
            'id', 'meter', 'meter_nickname', 'meter_number', 'token_code', 'masked_token',
            'units', 'status', 'message', 'created_at', 'applied_at'
        ]
        read_only_fields = ['created_at', 'applied_at', 'masked_token']


class AutoRechargeConfigSerializer(serializers.ModelSerializer):
    time_window = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = AutoRechargeConfig
        fields = ['enabled', 'default_threshold', 'default_amount', 'default_payment_method', 'time_window_start', 'time_window_end', 'time_window', 'apply_to_all', 'updated_at']
        read_only_fields = ['updated_at']

    def get_time_window(self, obj):
        if obj.time_window_start and obj.time_window_end:
            return {
                'start': obj.time_window_start.isoformat(),
                'end': obj.time_window_end.isoformat()
            }
        return None


class AutoRechargeEventSerializer(serializers.ModelSerializer):
    meter_number = serializers.CharField(source='meter.meter_number', read_only=True)

    class Meta:
        model = AutoRechargeEvent
        fields = ['id', 'meter', 'meter_number', 'triggered_at', 'status', 'message', 'amount', 'executed_at']
        read_only_fields = ['id', 'triggered_at', 'executed_at']