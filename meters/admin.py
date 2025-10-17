from django.contrib import admin
from .models import Meter, Token
from .models import AutoRechargeConfig, AutoRechargeEvent, ManualRecharge, TokenPurchase, TokenPool

# Inline Token display under Meter
class TokenInline(admin.TabularInline):  # or StackedInline for vertical layout
    model = Token
    extra = 0
    fields = ("token_code", "amount", "units", "is_used", "created_at")
    readonly_fields = ("created_at",)
    show_change_link = True


@admin.register(Meter)
class MeterAdmin(admin.ModelAdmin):
    list_display = (
        "meter_number", "user", "nickname", "current_balance",
        "is_primary", "auto_recharge_enabled", "created_at"
    )
    search_fields = ("meter_number", "user__email", "nickname")
    list_filter = ("is_primary", "auto_recharge_enabled", "created_at")
    readonly_fields = ("created_at", "updated_at")
    inlines = [TokenInline]

    fieldsets = (
        ("Meter Information", {
            "fields": ("user", "meter_number", "nickname", "address")
        }),
        ("Recharge Settings", {
            "fields": (
                "is_primary", "auto_recharge_enabled",
                "auto_recharge_threshold", "auto_recharge_amount"
            ),
        }),
        ("Balance Details", {
            "fields": ("current_balance",),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
        }),
    )


@admin.register(Token)
class TokenAdmin(admin.ModelAdmin):
    list_display = ("token_code", "meter", "amount", "units", "is_used", "created_at")
    search_fields = ("token_code", "meter__meter_number")
    list_filter = ("is_used", "created_at")


@admin.register(AutoRechargeConfig)
class AutoRechargeConfigAdmin(admin.ModelAdmin):
    list_display = ("user", "enabled", "default_threshold", "default_amount", "default_payment_method", "updated_at")
    search_fields = ("user__email",)
    list_filter = ("enabled", "updated_at")
    readonly_fields = ("updated_at",)


@admin.register(AutoRechargeEvent)
class AutoRechargeEventAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "meter", "status", "amount", "triggered_at", "executed_at")
    search_fields = ("user__email", "meter__meter_number")
    list_filter = ("status", "triggered_at", "executed_at")
    readonly_fields = ("triggered_at", "executed_at")


@admin.register(ManualRecharge)
class ManualRechargeAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "meter", "masked_token", "status", "units", "created_at", "applied_at")
    search_fields = ("user__email", "meter__meter_number", "masked_token")
    list_filter = ("status", "created_at", "applied_at")
    readonly_fields = ("created_at", "applied_at", "masked_token")


@admin.register(TokenPurchase)
class TokenPurchaseAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "meter", "token_code", "amount", "units", "purchased_at")
    search_fields = ("user__email", "meter__meter_number", "token_code")
    list_filter = ("purchased_at",)
    readonly_fields = ("purchased_at",)


@admin.register(TokenPool)
class TokenPoolAdmin(admin.ModelAdmin):
    list_display = ("id", "token_code", "is_allocated", "allocated_to", "allocated_transaction_id", "units", "amount", "created_at")
    search_fields = ("token_code", "allocated_transaction_id", "allocated_to__email")
    list_filter = ("is_allocated", "created_at")
