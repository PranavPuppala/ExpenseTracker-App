# expenses/serializers.py
from rest_framework import serializers
from .models import Expense


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
