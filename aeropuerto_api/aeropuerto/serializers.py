from rest_framework import serializers
from .models import Gates, Flights


# Serializador para la tabla de Puertas de Embarque (Gates) (POSTGRESQL)
class GatesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gates
        fields = ["id", "code", "terminal", "is_available", "created_at"]
        read_only_fields = ["id", "created_at"]


# Serializador para la tabla de Vuelos (Flights) (POSTGRESQL)
class FlightsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flights
        fields = [
            "id",
            "gate_id",
            "flight_number",
            "destination",
            "status",
            "departure_time",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]