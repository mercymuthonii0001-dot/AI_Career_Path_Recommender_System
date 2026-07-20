from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from .apps import create_default_admin_user
from .models import Profile


class ProfileOnboardingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="student", email="student@example.com", password="Password123")
        self.client.force_authenticate(user=self.user)

    def test_duplicate_username_returns_validation_error(self):
        response = self.client.post(
            "/api/register",
            {
                "username": "student",
                "email": "newstudent@example.com",
                "password": "Password123",
                "full_name": "Another Student",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("already taken", response.json()["username"][0].lower())

    def test_default_admin_user_is_created_with_expected_credentials(self):
        create_default_admin_user()
        user = User.objects.filter(email="mercymuthonii0001@gmail.com").first()

        self.assertIsNotNone(user)
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.check_password("admin123"))

    def test_existing_admin_password_is_not_overwritten(self):
        User.objects.filter(email__iexact="mercymuthonii0001@gmail.com").delete()
        user = User.objects.create_user(username="existing-admin", email="mercymuthonii0001@gmail.com", password="KeepThisPassword")

        create_default_admin_user()
        user.refresh_from_db()

        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.check_password("KeepThisPassword"))
        self.assertFalse(user.check_password("admin123"))

    def test_profile_update_supports_onboarding_details(self):
        response = self.client.put(
            "/api/profile",
            {
                "study_status": "new",
                "student_type": "first_time_applicant",
                "education_level": "high_school",
                "career_goal": "Become a data analyst",
                "support_note": "I need simple guidance and practical steps",
                "onboarding_completed": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        profile = Profile.objects.get(user=self.user)
        self.assertEqual(profile.study_status, "new")
        self.assertEqual(profile.student_type, "first_time_applicant")
        self.assertEqual(profile.education_level, "high_school")
        self.assertEqual(profile.career_goal, "Become a data analyst")
        self.assertEqual(profile.support_note, "I need simple guidance and practical steps")
        self.assertTrue(profile.onboarding_completed)
