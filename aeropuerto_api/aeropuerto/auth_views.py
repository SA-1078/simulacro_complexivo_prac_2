"""
================================================================================
VISTAS DE REGISTRO DE USUARIOS (/api/auth/register/)
================================================================================
Permite el registro público de nuevos usuarios en el sistema.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .auth_serializers import RegisterSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    """
    Endpoint público para crear un nuevo usuario en la base de datos de Django.
    """
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response(
        {"id": user.id, "username": user.username, "email": user.email},
        status=status.HTTP_201_CREATED
    )