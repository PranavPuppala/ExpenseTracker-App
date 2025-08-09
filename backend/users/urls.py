from django.urls import path
from .views import (
    RegisterView, LoginView, RefreshView,
    LogoutView, ProfileView, PasswordChangeView,
)

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("login/",    LoginView.as_view()),
    path("refresh/",  RefreshView.as_view()),
    path("logout/",   LogoutView.as_view()),
    path("profile/",       ProfileView.as_view()),
    path("change-password/", PasswordChangeView.as_view()),
]
