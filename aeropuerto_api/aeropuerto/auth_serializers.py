"""
================================================================================
SERIALIZADOR DE REGISTRO DE USUARIOS
================================================================================
Crea usuarios con contraseñas cifradas usando el modelo de autenticación de Django.
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    # Campo de contraseña de solo escritura con longitud mínima de 6 caracteres
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        # Utiliza create_user para hashear la contraseña de forma segura
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        return user