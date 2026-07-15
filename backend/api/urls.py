from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CareerListView,
    RecommendationHistoryView,
    RegisterView,
    login_view,
    logout_view,
    profile_view,
    recommend_view,
)

urlpatterns = [
    path("register", RegisterView.as_view(), name="register"),
    path("login", login_view, name="login"),
    path("logout", logout_view, name="logout"),
    path("token/refresh", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile", profile_view, name="profile"),
    path("recommend", recommend_view, name="recommend"),
    path("history", RecommendationHistoryView.as_view(), name="history"),
    path("careers", CareerListView.as_view(), name="careers"),
]
