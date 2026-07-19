from django.contrib.auth import logout
from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .ml.recommender import CAREER_DETAILS, predict_career
from .models import Career, Profile, RecommendationHistory
from .serializers import (
    CareerSerializer,
    LoginSerializer,
    ProfileSerializer,
    RecommendationHistorySerializer,
    RecommendationRequestSerializer,
    RegisterSerializer,
)


def _tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


def seed_careers():
    for name, details in CAREER_DETAILS.items():
        Career.objects.get_or_create(
            name=name,
            defaults={
                "description": details["description"],
                "required_skills": details["required_skills"],
                "learning_resources": details["learning_resources"],
            },
        )


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            return Response(
                {
                    "message": "Account created successfully.",
                    "user": {"id": user.id, "username": user.username, "email": user.email},
                    "tokens": _tokens_for_user(user),
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as exc:
            print("[register error]", type(exc).__name__, str(exc), flush=True)
            raise


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data["user"]
    return Response(
        {
            "message": "Login successful.",
            "user": {"id": user.id, "username": user.username, "email": user.email},
            "tokens": _tokens_for_user(user),
        }
    )


@api_view(["POST"])
def logout_view(request):
    refresh_token = request.data.get("refresh")
    if refresh_token:
        try:
            RefreshToken(refresh_token).blacklist()
        except Exception:
            pass
    logout(request)
    return Response({"message": "Logout successful."})


@api_view(["GET", "PUT"])
def profile_view(request):
    profile, _ = Profile.objects.get_or_create(
        user=request.user,
        defaults={
            "full_name": request.user.get_full_name() or request.user.username,
            "email": request.user.email,
        },
    )
    if request.method == "GET":
        return Response(ProfileSerializer(profile).data)

    serializer = ProfileSerializer(profile, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["POST"])
def recommend_view(request):
    serializer = RecommendationRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    seed_careers()

    result = predict_career(
        serializer.validated_data["favourite_subject"],
        serializer.validated_data["interest_area"],
        serializer.validated_data["skills"],
    )

    history = RecommendationHistory.objects.create(
        user=request.user,
        favourite_subject=serializer.validated_data["favourite_subject"],
        interest_area=serializer.validated_data["interest_area"],
        skills=serializer.validated_data["skills"],
        predicted_career=result["predicted_career"],
        confidence_score=result["confidence_score"],
        career_description=result["description"],
        required_skills=result["required_skills"],
        learning_resources=result["learning_resources"],
        recommended_courses=result["recommended_courses"],
    )
    return Response(RecommendationHistorySerializer(history).data, status=status.HTTP_201_CREATED)


class RecommendationHistoryView(generics.ListAPIView):
    serializer_class = RecommendationHistorySerializer

    def get_queryset(self):
        return RecommendationHistory.objects.filter(user=self.request.user)


class CareerListView(generics.ListAPIView):
    serializer_class = CareerSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        seed_careers()
        return Career.objects.all()



@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def health_view(request):
    return Response({"status": "ok"})
