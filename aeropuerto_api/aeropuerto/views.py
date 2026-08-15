from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Gates, Flights
from .serializers import GatesSerializer, FlightsSerializer
from .permissions import IsAdminOrReadOnly

class GateViewSet(viewsets.ModelViewSet):
    queryset = Gates.objects.all().order_by("id")
    serializer_class = GatesSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ["code"]
    ordering_fields = ["id", "code", "terminal", "is_available"]

class FlightViewSet(viewsets.ModelViewSet):
    queryset = Flights.objects.select_related("gate_id").all().order_by("-id")
    serializer_class = FlightsSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["gate_id"]
    search_fields = ["flight_number", "destination", "status", "departure_time", "created_at"]
    ordering_fields = ["id", "gate_id", "flight_number", "destination", "status", "created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        return qs

    def get_permissions(self):
        # Público: SOLO listar vehículos
        if self.action == "list":
            return [AllowAny()]
        return super().get_permissions()