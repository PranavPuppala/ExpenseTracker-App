from datetime import date, timedelta
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, viewsets, generics
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Expense
from .serializers import ExpenseSerializer, DailySeriesSerializer, DashboardSummarySerializer
from .filters import ExpenseFilter
from .pagination import ExpenseCursorPagination


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    CRUD + filtering for the Expenses page.
    """
    serializer_class   = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend]
    filterset_class    = ExpenseFilter
    pagination_class   = ExpenseCursorPagination

    def get_queryset(self):
        # Always scope to the logged-in user
        return Expense.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the owner to the current user
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        /expenses/recent/ → Get the 5 most recent expenses
        """
        recent_expenses = self.get_queryset().order_by('-date', '-created_at')[:5]
        serializer = self.get_serializer(recent_expenses, many=True)
        return Response(serializer.data)


class DailySeriesView(generics.GenericAPIView):
    """
    /expenses/series/daily/?days=30  →  [{ "date": YYYY-MM-DD, "total": "123.45" }]
    Supplies the dashboards 30-day trend line.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from collections import defaultdict
        
        days = int(request.query_params.get("days", 30))
        cutoff = date.today() - timedelta(days=days - 1)

        # Get all expenses from the date range
        expenses = (
            Expense.objects
            .filter(owner=request.user, date__gte=cutoff)
            .values('date', 'amount')
            .order_by('date')
        )
        
        # Group by date manually
        daily_totals = defaultdict(float)
        for expense in expenses:
            daily_totals[expense['date']] += float(expense['amount'])
        
        # Convert to the format expected by the frontend
        result = []
        for expense_date, total in daily_totals.items():
            result.append({
                'day': expense_date.strftime('%Y-%m-%d'),
                'total': total
            })
        
        # Sort by date
        result.sort(key=lambda x: x['day'])
        return Response(result)


class DashboardSummaryView(generics.GenericAPIView):
    """
    /expenses/dashboard/ → All dashboard statistics in one call
    """
    serializer_class = DashboardSummarySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        today = date.today()
        
        # Current month dates
        current_month_start = today.replace(day=1)
        if today.month == 1:
            previous_month_start = date(today.year - 1, 12, 1)
            previous_month_end = date(today.year, 1, 1) - timedelta(days=1)
        else:
            previous_month_start = date(today.year, today.month - 1, 1)
            previous_month_end = current_month_start - timedelta(days=1)
        
        # Current week dates (Monday to Sunday)
        week_start = today - timedelta(days=today.weekday())
        
        # 1. Current month total
        current_month_total = Expense.objects.filter(
            owner=user, 
            date__gte=current_month_start,
            date__lte=today
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # 2. Previous month total
        previous_month_total = Expense.objects.filter(
            owner=user,
            date__gte=previous_month_start,
            date__lte=previous_month_end
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # 3. Trend percentage
        if previous_month_total > 0:
            trend_percentage = ((current_month_total - previous_month_total) / previous_month_total) * 100
        else:
            trend_percentage = 0 if current_month_total == 0 else 100
        
        # 4. Monthly average
        first_expense = Expense.objects.filter(owner=user).order_by('date').first()
        if first_expense:
            months_passed = ((today.year - first_expense.date.year) * 12 + 
                           (today.month - first_expense.date.month)) + 1
            all_time_total = Expense.objects.filter(owner=user).aggregate(
                total=Sum('amount'))['total'] or 0
            monthly_average = all_time_total / months_passed if months_passed > 0 else 0
        else:
            monthly_average = 0
        
        # 5. Active categories count (current month)
        active_categories_count = Expense.objects.filter(
            owner=user,
            date__gte=current_month_start,
            date__lte=today
        ).values('category').distinct().count()
        
        # 6. Top category for current month
        top_category_data = Expense.objects.filter(
            owner=user,
            date__gte=current_month_start,
            date__lte=today
        ).values('category').annotate(
            total=Sum('amount')
        ).order_by('-total').first()
        
        if top_category_data and current_month_total > 0:
            top_category = top_category_data['category']
            top_category_percentage = (top_category_data['total'] / current_month_total) * 100
        else:
            top_category = None
            top_category_percentage = 0
        
        # 7. Current week total
        current_week_total = Expense.objects.filter(
            owner=user,
            date__gte=week_start,
            date__lte=today
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        return Response({
            'current_month_total': float(current_month_total),
            'previous_month_total': float(previous_month_total),
            'trend_percentage': round(float(trend_percentage), 2),
            'monthly_average': round(float(monthly_average), 2),
            'active_categories_count': active_categories_count,
            'top_category': top_category,
            'top_category_percentage': round(float(top_category_percentage), 2),
            'current_week_total': float(current_week_total),
        })
