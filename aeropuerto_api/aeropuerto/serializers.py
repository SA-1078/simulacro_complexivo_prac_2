from rest_framework import serializers
from .models import Gates, Flights

class GatesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gates
        fields = ["id", "code", "terminal", "is_available", "created_at"]

class FlightsSerializer(serializers.ModelSerializer):
    flight_number = serializers.CharField(source="flight_number", read_only=True)

    class Meta:
        model = Flights
        fields = ["id", "gate_id", "flight_number", "destination", "status", "departure_time", "created_at"]