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
