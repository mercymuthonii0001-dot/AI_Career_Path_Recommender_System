from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Career, Profile, RecommendationHistory


SUBJECTS = [
    "Mathematics",
    "English",
    "Physics",
    "Chemistry",
    "Biology",
    "Geography",
    "History",
    "Business Studies",
    "Computer Studies",
]

INTEREST_AREAS = [
    "Technology",
    "Business",
    "Healthcare",
    "Education",
    "Engineering",
    "Arts",
    "Agriculture",
    "Finance",
]

SKILLS = [
    "Problem Solving",
    "Communication",
    "Creativity",
    "Leadership",
    "Programming",
    "Analysis",
    "Teamwork",
]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    full_name = serializers.CharField(write_only=True, max_length=120)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "full_name"]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        full_name = validated_data.pop("full_name")
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        Profile.objects.create(
            user=user,
            full_name=full_name,
            email=user.email,
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs["username"], password=attrs["password"])
        if not user:
            raise serializers.ValidationError("Invalid username or password.")
        attrs["user"] = user
        return attrs


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Profile
        fields = [
            "id",
            "username",
            "full_name",
            "email",
            "course",
            "year_of_study",
            "study_status",
            "onboarding_completed",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "username", "created_at", "updated_at"]


class CareerSerializer(serializers.ModelSerializer):
    required_skills = serializers.SerializerMethodField()
    learning_resources = serializers.SerializerMethodField()

    class Meta:
        model = Career
        fields = ["id", "name", "description", "required_skills", "learning_resources", "recommended_courses"]

    def get_required_skills(self, obj):
        return [item.strip() for item in obj.required_skills.split(",") if item.strip()]

    def get_learning_resources(self, obj):
        return [item.strip() for item in obj.learning_resources.split("|") if item.strip()]

    def get_recommended_courses(self, obj):
        return [item.strip() for item in obj.recommended_courses.split("|") if item.strip()]


class RecommendationRequestSerializer(serializers.Serializer):
    favourite_subject = serializers.ChoiceField(choices=SUBJECTS)
    interest_area = serializers.ChoiceField(choices=INTEREST_AREAS)
    skills = serializers.ListField(
        child=serializers.ChoiceField(choices=SKILLS),
        min_length=1,
        max_length=len(SKILLS),
    )


class RecommendationHistorySerializer(serializers.ModelSerializer):
    required_skills = serializers.SerializerMethodField()
    learning_resources = serializers.SerializerMethodField()

    class Meta:
        model = RecommendationHistory
        fields = [
            "id",
            "favourite_subject",
            "interest_area",
            "skills",
            "predicted_career",
            "confidence_score",
            "career_description",
            "required_skills",
            "learning_resources",
            "recommended_courses",
            "created_at",
        ]

    def get_required_skills(self, obj):
        return [item.strip() for item in obj.required_skills.split(",") if item.strip()]

    def get_learning_resources(self, obj):
        return [item.strip() for item in obj.learning_resources.split("|") if item.strip()]

    def get_recommended_courses(self, obj):
        return obj.recommended_courses or []
