from django.apps import AppConfig
from django.contrib.auth import get_user_model
from django.db.models.signals import post_migrate


def create_default_admin_user(*args, **kwargs):
    User = get_user_model()
    email = "mercymuthonii0001@gmail.com"
    password = "admin123"

    user = User.objects.filter(email__iexact=email).first()
    if user is None:
        User.objects.create_superuser(username="admin", email=email, password=password)
        return

    user.is_staff = True
    user.is_superuser = True
    user.email = email
    user.username = user.username or "admin"
    update_fields = ["is_staff", "is_superuser", "email", "username"]
    if not user.has_usable_password():
        user.set_password(password)
        update_fields.append("password")
    user.save(update_fields=update_fields)


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
        post_migrate.connect(create_default_admin_user, sender=self, dispatch_uid="api.create_default_admin_user")
