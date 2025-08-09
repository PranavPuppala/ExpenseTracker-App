
from django.conf import settings
from django.db import models


class Expense(models.Model):
    """
    A single out-going money transaction recorded by a user.
    """

    # ─────────────────────────────
    # Enumerations
    # ─────────────────────────────
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

    # ─────────────────────────────
    # Core fields
    # ─────────────────────────────
    owner          = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="expenses",
    )
    amount         = models.DecimalField(max_digits=10, decimal_places=2)
    category       = models.CharField(
        max_length=20, choices=Category.choices, default=Category.OTHER
    )
    payment_method = models.CharField(
        max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.OTHER
    )
    description    = models.TextField(blank=True)
    date           = models.DateField()            # explicit date picker on UI

    # ─────────────────────────────
    # Metadata
    # ─────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-created_at"]         # newest first
        indexes = [
            models.Index(fields=["owner", "date"]),
            models.Index(fields=["owner", "category"]),
        ]

    def __str__(self):
        return f"{self.owner_id} • {self.amount} • {self.category}"

