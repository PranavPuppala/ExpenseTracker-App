from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal


def validate_not_future_date(value):
    if value > timezone.now().date():
        raise ValidationError("Date cannot be in the future.")


class Expense(models.Model):

    class Category(models.TextChoices):
        GROCERIES      = "GROCERIES", "Groceries"
        ENTERTAINMENT  = "ENTERTAINMENT", "Entertainment"
        UTILITIES      = "UTILITIES", "Utilities"
        DINING_OUT     = "DINING_OUT", "Dining Out"
        TRANSPORTATION = "TRANSPORTATION", "Transportation"
        HOUSING        = "HOUSING", "Housing"
        HEALTHCARE     = "HEALTHCARE", "Healthcare"
        EDUCATION      = "EDUCATION", "Education"
        OTHER          = "OTHER", "Other"

    class PaymentMethod(models.TextChoices):
        DEBIT_CARD    = "DEBIT_CARD", "Debit Card"
        CREDIT_CARD   = "CREDIT_CARD", "Credit Card"
        CASH          = "CASH", "Cash"
        BANK_TRANSFER = "BANK_TRANSFER", "Bank Transfer"
        OTHER         = "OTHER", "Other"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="expenses",
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))]
    )
    category = models.CharField(
        max_length=20, choices=Category.choices, default=Category.OTHER
    )
    payment_method = models.CharField(
        max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.OTHER
    )
    description = models.TextField(max_length=500)
    date = models.DateField(validators=[validate_not_future_date])

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-created_at"]
        indexes = [
            models.Index(fields=["owner", "date"]),
            models.Index(fields=["owner", "category"]),
        ]

    def __str__(self):
        return f"{self.date} • {self.amount} • {self.category}"