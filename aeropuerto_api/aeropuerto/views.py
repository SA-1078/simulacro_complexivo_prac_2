
from datetime import datetime, timezone
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Gates, Flights
from .serializers import GatesSerializer, FlightsSerializer
from .permissions import IsAdminOrReadOnly
from .mongo import db


# Puertas de Embarque (/api/gates/)

class GateViewSet(viewsets.ModelViewSet):
    """
    CRUD completo para puertas de embarque.
    - GET /api/gates/ : Público (listar)
    - POST /api/gates/ : Requiere staff/admin (crear)
    - PUT/PATCH /api/gates/<id>/ : Requiere staff/admin (editar)
    - DELETE /api/gates/<id>/ : Requiere staff/admin (eliminar)
    """
    queryset = Gates.objects.all().order_by("id")
    serializer_class = GatesSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]

    # Filtros exactos: ?is_available=true & ?terminal=T1
    filterset_fields = ["is_available", "terminal"]
    # Búsqueda por texto: ?search=G01
    search_fields = ["code", "terminal"]
    # Ordenamiento: ?ordering=-id o ?ordering=code
    ordering_fields = ["id", "code", "terminal", "is_available", "created_at"]



# Vuelos (/api/flights/)
class FlightViewSet(viewsets.ModelViewSet):
    """
    CRUD completo para vuelos en PostgreSQL.
    - GET /api/flights/ : Público (listar)
    - POST /api/flights/ : Requiere staff/admin (crear) e inserta evento en MongoDB
    - PUT/PATCH /api/flights/<id>/ : Requiere staff/admin (editar)
    - DELETE /api/flights/<id>/ : Requiere staff/admin (eliminar)
    """
    queryset = Flights.objects.select_related("gate_id").all().order_by("-id")
    serializer_class = FlightsSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]

    # Filtros exactos: ?gate_id=1 & ?status=SCHEDULED
    filterset_fields = ["gate_id", "status"]
    # Búsqueda por texto: ?search=AA1234 o ?search=Miami
    search_fields = ["flight_number", "destination", "status", "gate_id__code"]
    # Ordenamiento: ?ordering=-departure_time
    ordering_fields = ["id", "gate_id", "flight_number", "destination", "status", "departure_time", "created_at"]

    def perform_create(self, serializer):
        """
        Al crear un vuelo en PostgreSQL, genera automáticamente el evento
        operativo inicial en MongoDB (colección 'flight_events').
        """
        flight = serializer.save()
        try:
            # Insertar registro de auditoría en MongoDB
            db["flight_events"].insert_one({
                "flight_id": flight.id,
                "event_type": "CREATED",
                "source": "SYSTEM",
                "note": f"Vuelo {flight.flight_number} programado hacia {flight.destination}",
                "created_at": datetime.now(timezone.utc)
            })
        except Exception:
            # Si MongoDB no responde, no bloquear la creación del vuelo relacional
            pass