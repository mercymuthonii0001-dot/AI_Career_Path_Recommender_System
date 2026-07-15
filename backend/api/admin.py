from django.contrib import admin

from .models import Career, Profile, RecommendationHistory


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "course", "year_of_study", "updated_at")
    search_fields = ("full_name", "email", "course")


@admin.register(Career)
class CareerAdmin(admin.ModelAdmin):
    list_display = ("name", "updated_at")
    search_fields = ("name", "description", "required_skills")


@admin.register(RecommendationHistory)
class RecommendationHistoryAdmin(admin.ModelAdmin):
    list_display = ("user", "predicted_career", "confidence_score", "created_at")
    list_filter = ("predicted_career", "created_at")
    search_fields = ("user__username", "predicted_career", "favourite_subject", "interest_area")
    readonly_fields = ("created_at",)
