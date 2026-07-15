from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Profile


class ProfileOnboardingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="student", email="student@example.com", password="Password123")
        self.client.force_authenticate(user=self.user)

    def test_profile_update_supports_onboarding_details(self):
        response = self.client.put(
            "/api/profile",
            {"study_status": "new", "onboarding_completed": True},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        profile = Profile.objects.get(user=self.user)
        self.assertEqual(profile.study_status, "new")
        self.assertTrue(profile.onboarding_completed)
