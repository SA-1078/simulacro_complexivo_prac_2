"""
================================================================================
RUTAS PRINCIPALES DEL PROYECTO (config/urls.py)
================================================================================
Define los puntos de entrada para:
- Panel de administración de Django (/admin/)
- Autenticación JWT (login, refresh, register)
- Endpoints de la API (/api/...)
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from aeropuerto.auth_views import register_view

urlpatterns = [
    # Panel de administración de Django
    path("admin/", admin.site.urls),

    # Autenticación JWT (Simple JWT)
    path("api/auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/register/", register_view, name="register"),

    # Rutas de la aplicación de aeropuerto (PostgreSQL + MongoDB)
    path("api/", include("aeropuerto.urls")),
]