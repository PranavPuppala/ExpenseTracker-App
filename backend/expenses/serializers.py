# expenses/serializers.py
from rest_framework import serializers
from .models import Expense
from .colors import CATEGORY_COLORS


class ExpenseSerializer(serializers.ModelSerializer):
    """
    Full CRUD representation used by:
      • Expenses table (list & detail)
      • Add-/Edit-expense forms
    """

    class Meta:
        model = Expense
        # All editable + meta fields the UI needs
        fields = (
            "id",
            "amount",
            "category",
            "payment_method",
            "description",
            "date",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_at", "updated_at")


class DailySeriesSerializer(serializers.Serializer):
    """
    Lightweight object for the 30-day trend chart on the dashboard.
      [{ "date": "2025-08-06", "total": "123.45" }, …]
    """
    date  = serializers.DateField()
    total = serializers.DecimalField(max_digits=10, decimal_places=2)


class DashboardSummarySerializer(serializers.Serializer):
    """
    Complete dashboard statistics in a single response.
    Used by DashboardSummaryView for all dashboard cards.
    """
    # Current month stats
    current_month_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    previous_month_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    trend_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    
    # Monthly average
    monthly_average = serializers.DecimalField(max_digits=10, decimal_places=2)
    active_categories_count = serializers.IntegerField()
    
    # Top category
    top_category = serializers.CharField(allow_null=True)
    top_category_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    
    # Recent expenses
    current_week_total = serializers.DecimalField(max_digits=10, decimal_places=2)


# ──────────────────────────────────────────────────────────────────────
# OPTIONAL: keep this here (unused for now) so re-adding a category
# summary chart later is trivial—just wire the view & URL.
# ──────────────────────────────────────────────────────────────────────
class CategorySummarySerializer(serializers.Serializer):
    """
    Server-side aggregation per category with its agreed colour.
      [{ "category": "GROCERIES", "total": "257.45", "color": "#0f7b46" }]
    """
    category = serializers.CharField()
    total    = serializers.DecimalField(max_digits=10, decimal_places=2)
    color    = serializers.SerializerMethodField()

    def get_color(self, obj):
        # obj["category"] already contains the enum key
        return CATEGORY_COLORS.get(obj["category"], "#000000")