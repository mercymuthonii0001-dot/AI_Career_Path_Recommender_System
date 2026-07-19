from django.conf import settings
from django.db import models


class Profile(models.Model):
    YEAR_CHOICES = [
        ("1", "Year 1"),
        ("2", "Year 2"),
        ("3", "Year 3"),
        ("4", "Year 4"),
    ]

    STUDY_STATUS_CHOICES = [
        ("new", "New to the system"),
        ("continuing", "Continuing student"),
    ]

    STUDENT_TYPE_CHOICES = [
        ("first_time_applicant", "First-time applicant"),
        ("continuing_student", "Continuing student"),
        ("high_school_student", "High school student"),
    ]

    EDUCATION_LEVEL_CHOICES = [
        ("high_school", "High school"),
        ("college", "College"),
        ("university", "University"),
        ("vocational", "Vocational / technical"),
        ("other", "Other"),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=120)
    email = models.EmailField()
    course = models.CharField(max_length=120, blank=True)
    year_of_study = models.CharField(max_length=1, choices=YEAR_CHOICES, blank=True)
    study_status = models.CharField(max_length=20, choices=STUDY_STATUS_CHOICES, blank=True)
    student_type = models.CharField(max_length=30, choices=STUDENT_TYPE_CHOICES, blank=True)
    education_level = models.CharField(max_length=20, choices=EDUCATION_LEVEL_CHOICES, blank=True)
    career_goal = models.CharField(max_length=200, blank=True)
    support_note = models.TextField(blank=True)
    onboarding_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name or self.user.username


class Career(models.Model):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField()
    required_skills = models.TextField()
    learning_resources = models.TextField()
    recommended_courses = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class RecommendationHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    favourite_subject = models.CharField(max_length=80)
    interest_area = models.CharField(max_length=80)
    skills = models.JSONField(default=list)
    predicted_career = models.CharField(max_length=120)
    confidence_score = models.FloatField()
    career_description = models.TextField()
    required_skills = models.TextField()
    learning_resources = models.TextField()
    recommended_courses = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Recommendation histories"

    def __str__(self):
        return f"{self.user.username} - {self.predicted_career}"
