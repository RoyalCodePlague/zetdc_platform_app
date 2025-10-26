from django.contrib import admin
from .models import User, AccountDeletionRequest, DataExportRequest
from meters.models import Meter
from transactions.models import Transaction

class MeterInline(admin.TabularInline):
    model = Meter
    extra = 0
    fields = ("meter_number", "nickname", "current_balance", "is_primary", "auto_recharge_enabled")
    readonly_fields = ("meter_number", "current_balance")
    show_change_link = True


class TransactionInline(admin.TabularInline):
    model = Transaction
    extra = 0
    fields = ("transaction_id", "meter", "amount", "status", "transaction_type", "created_at")
    readonly_fields = ("created_at",)
    show_change_link = True


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "first_name", "last_name", "is_active", "is_staff", "date_joined")
    search_fields = ("email", "first_name", "last_name")
    list_filter = ("is_active", "is_staff", "date_joined")
    readonly_fields = ("date_joined",)
    inlines = [MeterInline, TransactionInline]

    fieldsets = (
        ("Personal Info", {
            "fields": ("first_name", "last_name", "email", "password")
        }),
        ("Permissions", {
            "fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")
        }),
        ("Timestamps", {
            "fields": ("date_joined",),
        }),
    )


@admin.register(AccountDeletionRequest)
class AccountDeletionRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'status', 'requested_at', 'processed_at', 'processed_by')
    list_filter = ('status', 'requested_at', 'processed_at')
    search_fields = ('user__email', 'reason', 'notes')
    readonly_fields = ('requested_at',)
    
    actions = ['approve_deletion', 'reject_deletion']
    
    def approve_deletion(self, request, queryset):
        from django.utils import timezone
        for deletion_request in queryset.filter(status='pending'):
            deletion_request.status = 'approved'
            deletion_request.processed_at = timezone.now()
            deletion_request.processed_by = request.user
            deletion_request.save()
            
            # Soft-deactivate the user
            deletion_request.user.is_active = False
            deletion_request.user.save(update_fields=['is_active'])
            
        self.message_user(request, f"Approved {queryset.count()} deletion requests")
    approve_deletion.short_description = "Approve selected deletion requests"
    
    def reject_deletion(self, request, queryset):
        from django.utils import timezone
        for deletion_request in queryset.filter(status='pending'):
            deletion_request.status = 'rejected'
            deletion_request.processed_at = timezone.now()
            deletion_request.processed_by = request.user
            deletion_request.save()
        self.message_user(request, f"Rejected {queryset.count()} deletion requests")
    reject_deletion.short_description = "Reject selected deletion requests"


@admin.register(DataExportRequest)
class DataExportRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'status', 'requested_at', 'completed_at')
    list_filter = ('status', 'requested_at', 'completed_at')
    search_fields = ('user__email',)
    readonly_fields = ('requested_at',)
