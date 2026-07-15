from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def home_view(request):
    return JsonResponse(
        {
            "message": "AI Career Recommender API is running",
            "status": "ok",
            "docs": "/api/",
        }
    )


urlpatterns = [
    path("", home_view, name="home"),
    path("health/", lambda request: JsonResponse({"status": "ok"}), name="health"),
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
]
