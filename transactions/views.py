from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, DateFilter, CharFilter
from .models import Transaction
from .serializers import TransactionSerializer


class TransactionFilterSet(FilterSet):
    date_from = DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = DateFilter(field_name='created_at', lookup_expr='lte')
    meter = CharFilter(method='filter_by_meter')

    class Meta:
        model = Transaction
        fields = ['status', 'transaction_type', 'date_from', 'date_to', 'meter']

    def filter_by_meter(self, queryset, name, value):
        # allow filtering by meter id or meter_number substring
        try:
            mid = int(value)
            return queryset.filter(meter__id=mid)
        except Exception:
            return queryset.filter(meter__meter_number__icontains=value)


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TransactionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TransactionFilterSet
    search_fields = ['transaction_id', 'description']
    ordering_fields = ['created_at', 'amount']

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)