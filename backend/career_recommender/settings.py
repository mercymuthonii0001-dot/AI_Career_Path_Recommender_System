import os
from datetime import timedelta
from pathlib import Path
from urllib.parse import urlparse

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def _is_valid_origin(value):
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def _get_env_list(name, default):
    raw = os.getenv(name)
    if raw:
        items = [item.strip() for item in raw.split(",") if item.strip()]
        valid_items = [item for item in items if _is_valid_origin(item)]
        if valid_items:
            return valid_items
    return [item.strip() for item in default.split(",") if item.strip()]


def _get_host_list(name, default):
    """Return a list of hostnames from an env var without requiring a URL scheme.

    This is used for ALLOWED_HOSTS which expects hostnames (optionally
    prefixed with a leading dot for subdomains), not full URLs.
    """
    placeholders = {
        "your-render-app.onrender.com",
        "your-backend-app.onrender.com",
        "your-frontend-app.vercel.app",
        "your-domain.com",
    }
    raw = os.getenv(name)
    items = [item.strip() for item in (raw or default).split(",") if item.strip()]
    normalized = []
    for item in items:
        if item in placeholders:
            continue
        # If a full URL was provided (e.g. https://example.com), extract the netloc
        try:
            parsed = urlparse(item)
            host = parsed.netloc or item
        except Exception:
            host = item
        # strip any trailing slashes and whitespace
        host = host.strip().rstrip("/")
        if host:
            normalized.append(host)
    return normalized


SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-change-this-secret-key")
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

SESSION_ENGINE = os.getenv("SESSION_ENGINE", "django.contrib.sessions.backends.file")
SESSION_FILE_PATH = os.getenv("SESSION_FILE_PATH", str(BASE_DIR / "sessions"))
SESSION_DIR = Path(SESSION_FILE_PATH)
SESSION_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_HOSTS = _get_host_list(
    "ALLOWED_HOSTS",
    "localhost,127.0.0.1,.onrender.com,.vercel.app,testserver,ai-career-path-recommender-system.onrender.com",
)

CORS_ALLOWED_ORIGINS = _get_env_list(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173",
)

CORS_ALLOWED_ORIGIN_REGEXES = _get_env_list(
    "CORS_ALLOWED_ORIGIN_REGEXES",
    r"^https://.*\.vercel\.app$",
)

CSRF_TRUSTED_ORIGINS = _get_env_list(
    "CSRF_TRUSTED_ORIGINS",
    "http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173",
)

# Emit minimal startup debug info so deploy logs show effective runtime config.
try:
    print("[settings] ALLOWED_HOSTS=", ALLOWED_HOSTS, flush=True)
    print("[settings] CORS_ALLOWED_ORIGINS=", CORS_ALLOWED_ORIGINS, flush=True)
    print("[settings] CSRF_TRUSTED_ORIGINS=", CSRF_TRUSTED_ORIGINS, flush=True)
except Exception:
    # Avoid failing startup due to logging issues
    pass

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "api",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "career_recommender.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "career_recommender.wsgi.application"

DATABASE_URL = os.getenv("DATABASE_URL")
USE_SQLITE_FALLBACK = os.getenv("DJANGO_USE_SQLITE", "True").lower() == "true"

if DATABASE_URL and not USE_SQLITE_FALLBACK:
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            ssl_require=os.getenv("DB_SSL_REQUIRE", "True").lower() == "true",
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Nairobi"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=6),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "False").lower() == "true"
CSRF_COOKIE_SECURE = os.getenv("CSRF_COOKIE_SECURE", "False").lower() == "true"
