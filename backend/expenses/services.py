from datetime import date, timedelta
from django.utils import timezone
from django.db.models import Sum
from .models import Expense


def get_daily_series(user, days):
    end_date = timezone.now().date()
    cutoff = end_date - timedelta(days=days - 1)
    qs = (
        Expense.objects
        .filter(owner=user, date__gte=cutoff, date__lte=end_date)
        .values("date")
        .annotate(total=Sum("amount"))
    )
    totals_by_date = {row["date"]: float(row["total"]) for row in qs}
    return [
        {
            "day": (cutoff + timedelta(days=i)).strftime("%Y-%m-%d"),
            "total": totals_by_date.get(cutoff + timedelta(days=i), 0.0)
        }
        for i in range(days)
    ]


def get_dashboard_summary(user):
    today = timezone.now().date()
    current_month_start = today.replace(day=1)

    if today.month == 1:
        previous_month_start = date(today.year - 1, 12, 1)
        previous_month_end = date(today.year, 1, 1) - timedelta(days=1)
    else:
        previous_month_start = date(today.year, today.month - 1, 1)
        previous_month_end = current_month_start - timedelta(days=1)

    week_start = today - timedelta(days=today.weekday())

    current_month_qs = Expense.objects.filter(
        owner=user,
        date__gte=current_month_start,
        date__lte=today
    )

    current_month_total = current_month_qs.aggregate(
        total=Sum('amount'))['total'] or 0

    previous_month_total = Expense.objects.filter(
        owner=user,
        date__gte=previous_month_start,
        date__lte=previous_month_end
    ).aggregate(total=Sum('amount'))['total'] or 0

    if previous_month_total > 0:
        trend_percentage = (
            (current_month_total - previous_month_total) / previous_month_total
        ) * 100
    else:
        trend_percentage = 0 if current_month_total == 0 else 100

    first_expense = Expense.objects.filter(owner=user).order_by('date').first()
    if first_expense:
        months_passed = (
            (today.year - first_expense.date.year) * 12 +
            (today.month - first_expense.date.month)
        ) + 1
        all_time_total = Expense.objects.filter(
            owner=user
        ).aggregate(total=Sum('amount'))['total'] or 0
        monthly_average = all_time_total / months_passed if months_passed > 0 else 0
    else:
        monthly_average = 0

    active_categories_count = current_month_qs.values(
        'category').distinct().count()

    top_category_data = current_month_qs.values(
        'category'
    ).annotate(
        total=Sum('amount')
    ).order_by('-total').first()

    if top_category_data and current_month_total > 0:
        top_category = top_category_data['category']
        top_category_percentage = (
            top_category_data['total'] / current_month_total
        ) * 100
    else:
        top_category = None
        top_category_percentage = 0

    current_week_total = Expense.objects.filter(
        owner=user,
        date__gte=week_start,
        date__lte=today
    ).aggregate(total=Sum('amount'))['total'] or 0

    return {
        'current_month_total': float(current_month_total),
        'previous_month_total': float(previous_month_total),
        'trend_percentage': round(float(trend_percentage), 2),
        'monthly_average': round(float(monthly_average), 2),
        'active_categories_count': active_categories_count,
        'top_category': top_category,
        'top_category_percentage': round(float(top_category_percentage), 2),
        'current_week_total': float(current_week_total),
    }