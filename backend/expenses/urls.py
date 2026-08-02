# expenses/urls.py

from django.urls import path
from .views import (
    ExpenseListCreateView,
    ExpenseDetailView,
    ExpenseRecentView,
    DailySeriesView,
    DashboardSummaryView
)

urlpatterns = [
    # Dashboard endpoints (keep first to avoid conflicts)
    path("dashboard/", DashboardSummaryView.as_view()),
    path("series/daily/", DailySeriesView.as_view()),
    path("recent/", ExpenseRecentView.as_view()),
    
    # Expense CRUD endpoints
    path("", ExpenseListCreateView.as_view()),
    path("<int:pk>/", ExpenseDetailView.as_view()),
]