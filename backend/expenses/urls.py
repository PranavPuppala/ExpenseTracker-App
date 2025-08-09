# expenses/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ExpenseViewSet, DailySeriesView, DashboardSummaryView

# DRF router handles all CRUD routes for the ExpenseViewSet
router = DefaultRouter()
router.register("", ExpenseViewSet, basename="expense")

urlpatterns = [
    # Put custom endpoints FIRST (before router)
    path("dashboard/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    path("series/daily/", DailySeriesView.as_view(), name="expense-daily-series"),
    
    # Router comes LAST to catch remaining patterns
    path("", include(router.urls)),
]