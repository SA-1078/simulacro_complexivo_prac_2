"""
================================================================================
CONFIGURACIÓN GENERAL DEL PROYECTO BACKEND (config/settings.py)
================================================================================
Configura:
1. Base de datos Relacional (PostgreSQL)
2. Base de datos No Relacional (MongoDB via PyMongo)
3. Autenticación JWT (djangorestframework-simplejwt)
4. Filtros, Búsqueda y Paginación (django-filter, rest_framework)
5. CORS Headers para consumo desde React (Vite)
"""

from pathlib import Path
import os
from datetime import timedelta
from dotenv import load_dotenv

# Ruta raíz del backend
BASE_DIR = Path(__file__).resolve().parent.parent

# Cargar variables de entorno desde archivo .env
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
DEBUG = os.getenv("DEBUG", "0") == "1"
ALLOWED_HOSTS = ["*"]

# ============================================================================
# APLICACIONES INSTALADAS
# ============================================================================
INSTALLED_APPS = [
    # Apps del núcleo de Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Librerías de terceros
    "rest_framework",      # Django REST Framework
    "django_filters",      # Soporte para filtrado avanzado
    "corsheaders",         # Soporte de cabeceras CORS para React

    # Aplicación principal del aeropuerto
    "aeropuerto",
]

# ============================================================================
# MIDDLEWARES
# ============================================================================
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # Debe ir arriba de CommonMiddleware
    "django.middleware.common.CommonMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

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

WSGI_APPLICATION = "config.wsgi.application"

# ============================================================================
# 1. BASE DE DATOS RELACIONAL: PostgreSQL (airport_db o db_aeropuerto)
# ============================================================================
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME", "db_aeropuerto"),
        "USER": os.getenv("DB_USER", "aeropuerto_user"),
        "PASSWORD": os.getenv("DB_PASSWORD", "admin123"),
        "HOST": os.getenv("DB_HOST", "127.0.0.1"),
        "PORT": os.getenv("DB_PORT", "5432"),
    }
}

# ============================================================================
# 2. BASE DE DATOS NO RELACIONAL: MongoDB (db_aeropuerto o airport_logs)
# ============================================================================
MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
MONGO_DB = os.getenv("MONGO_DB", "db_aeropuerto")

# Configuración regional
LANGUAGE_CODE = "es-ec"
TIME_ZONE = "America/Guayaquil"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ============================================================================
# 3. DJANGO REST FRAMEWORK (DRF) CONFIGURATION
# ============================================================================
REST_FRAMEWORK = {
    # Autenticación por token JWT en cabecera Authorization: Bearer <token>
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    # Permiso por defecto: requerir autenticación
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    # Paginación estándar de 10 registros por página
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,
    # Backends de filtrado, búsqueda y ordenamiento
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
}

# ============================================================================
# 4. CONFIGURACIÓN DE TOKENS JWT (SIMPLE JWT)
# ============================================================================
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),  # Token de acceso dura 30 minutos
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),     # Token de refresco dura 7 días
}

# ============================================================================
# 5. CONFIGURACIÓN DE CORS (PERMITIR PETICIONES DESDE EL FRONTEND REACT)
# ============================================================================
CORS_ALLOWED_ORIGINS = [
    os.getenv("CORS_ORIGIN", "http://localhost:5173"),
    "http://127.0.0.1:5173",
]