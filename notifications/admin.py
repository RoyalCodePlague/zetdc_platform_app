from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "notification_type", "is_read", "created_at")
    search_fields = ("title", "user__email")
    list_filter = ("notification_type", "is_read", "created_at")
    readonly_fields = ("created_at",)

    fieldsets = (
        ("Notification Info", {
            "fields": ("user", "notification_type", "title", "message")
        }),
        ("Status", {
            "fields": ("is_read",),
        }),
        ("Timestamps", {
            "fields": ("created_at",),
        }),
    )
