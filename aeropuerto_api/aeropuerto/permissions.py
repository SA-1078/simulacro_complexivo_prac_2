"""
================================================================================
PERMISOS PERSONALIZADOS - CONTROL DE ACCESO BASADO EN ROLES (RBAC)
================================================================================
IsAdminOrReadOnly:
- Métodos seguros (GET, HEAD, OPTIONS): Permitidos para cualquier cliente (público).
- Métodos de modificación (POST, PUT, PATCH, DELETE): Exigen que el usuario esté
  autenticado y tenga privilegios de administrador (is_staff=True).
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        # Permitir consultas públicas de solo lectura
        if request.method in SAFE_METHODS:
            return True
        
        # Exigir autenticación y rol de staff para crear, editar o eliminar
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_staff
        )