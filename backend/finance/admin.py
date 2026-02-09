from django.contrib import admin
from .models import EscrowTransaction


@admin.register(EscrowTransaction)
class EscrowTransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'user', 'transaction_type', 'amount', 
                    'status', 'created_at']
    list_filter = ['transaction_type', 'status', 'payment_gateway', 'created_at']
    search_fields = ['order__id', 'user__username', 'gateway_transaction_id']
    list_select_related = ['order', 'user']
