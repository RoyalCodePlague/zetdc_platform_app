from django.contrib import admin
from .models import SupportTicket


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ['id', 'subject', 'user', 'category', 'status', 'created_at']
    list_filter = ['status', 'category', 'created_at']
    search_fields = ['subject', 'message', 'user__email', 'user__username', 'email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Ticket Information', {
            'fields': ('user', 'subject', 'category', 'message', 'email')
        }),
        ('Status', {
            'fields': ('status', 'resolved_at')
        }),
        ('Admin Notes', {
            'fields': ('admin_notes',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user')
