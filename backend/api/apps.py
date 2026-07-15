from django.apps import AppConfig
from django.db.models.signals import post_migrate


class ApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"

    def ready(self):
        from .ml.recommender import ensure_model_ready
        from .ml.recommender import CAREER_DETAILS

        ensure_model_ready()

        def seed_careers(sender, **kwargs):
            from .models import Career

            for name, details in CAREER_DETAILS.items():
                Career.objects.get_or_create(
                    name=name,
                    defaults={
                        "description": details["description"],
                        "required_skills": details["required_skills"],
                        "learning_resources": details["learning_resources"],
                        "recommended_courses": details.get("recommended_courses", ""),
                    },
                )

        post_migrate.connect(seed_careers, sender=self, dispatch_uid="api.seed_careers")
