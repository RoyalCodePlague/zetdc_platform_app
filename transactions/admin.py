from django.contrib import admin
from .models import Transaction

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        "transaction_id", "user", "meter", "amount",
        "status", "transaction_type", "payment_method", "created_at"
    )
    search_fields = ("transaction_id", "user__email", "meter__meter_number")
    list_filter = ("status", "transaction_type", "payment_method", "created_at")
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        ("Transaction Details", {
            "fields": ("transaction_id", "user", "meter", "amount", "transaction_type", "payment_method")
        }),
        ("Status & Description", {
            "fields": ("status", "description"),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
        }),
    )
