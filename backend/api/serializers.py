from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Q
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
        extra_kwargs = {
            "username": {"validators": []},
            "email": {"validators": []},
        }

    def validate_username(self, value):
        username = value.strip()
        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError("That username is already taken. Please choose another one.")
        return username

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("That email is already taken. Please choose another one.")
        return email

    def create(self, validated_data):
        full_name = validated_data.pop("full_name").strip()
        password = validated_data.pop("password")
        validated_data["username"] = validated_data["username"].strip()
        validated_data["email"] = validated_data["email"].strip().lower()
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
        username_or_email = attrs["username"].strip()
        password = attrs["password"]
        user = authenticate(username=username_or_email, password=password)

        if not user:
            user_obj = User.objects.filter(email__iexact=username_or_email).first()
            if user_obj:
                user = authenticate(username=user_obj.username, password=password)

        if not user:
            raise serializers.ValidationError("Invalid username, email, or password.")

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
            "student_type",
            "education_level",
            "career_goal",
            "support_note",
            "onboarding_completed",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "username", "created_at", "updated_at"]

    def validate_email(self, value):
        email = value.strip().lower()
        user = self.instance.user if self.instance else None
        if User.objects.filter(email__iexact=email).exclude(pk=user.pk if user else None).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def validate_full_name(self, value):
        return value.strip()

    def validate_career_goal(self, value):
        return value.strip() if value else ""

    def validate_support_note(self, value):
        return value.strip() if value else ""

    def update(self, instance, validated_data):
        email = validated_data.get("email")
        if email:
            instance.user.email = email.strip().lower()
            instance.user.save(update_fields=["email"])

        if "full_name" in validated_data:
            validated_data["full_name"] = validated_data["full_name"].strip()

        return super().update(instance, validated_data)


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
