import django_filters
from .models import Expense


class ExpenseFilter(django_filters.FilterSet):
    search     = django_filters.CharFilter(
        field_name="description", lookup_expr="icontains"
    )
    category   = django_filters.CharFilter(
        field_name="category",    lookup_expr="iexact"
    )
    min_date   = django_filters.DateFilter(
        field_name="date",        lookup_expr="gte"
    )
    max_date   = django_filters.DateFilter(
        field_name="date",        lookup_expr="lte"
    )

    class Meta:
        model  = Expense
        fields = ["search", "category", "min_date", "max_date"]
