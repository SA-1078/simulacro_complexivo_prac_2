"""
================================================================================
RUTAS DE LA APLICACIÓN AEROPUERTO (/api/...)
================================================================================
Define las rutas para:
- Endpoints relacionales PostgreSQL (routers de ViewSets: gates y flights)
- Endpoints NoSQL MongoDB (function-based views: airlines y flight_events)
"""

from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import GateViewSet, FlightViewSet
from .airlines_views import airlines_list_create, airlines_detail
from .flight_events_views import flight_events_list_create, flight_events_detail

# Router de DRF para endpoints relacionales (ModelViewSet)
router = DefaultRouter()
router.register(r"gates", GateViewSet, basename="gates")
router.register(r"flights", FlightViewSet, basename="flights")

# Patrones de URL para endpoints basados en funciones (MongoDB)
urlpatterns = [
    # Rutas para la colección NoSQL 'airlines'
    path("airlines/", airlines_list_create, name="airlines_list_create"),
    path("airlines/<str:id>/", airlines_detail, name="airlines_detail"),

    # Rutas para la colección NoSQL 'flight_events'
    path("flight_events/", flight_events_list_create, name="flight_events_list_create"),
    path("flight_events/<str:id>/", flight_events_detail, name="flight_events_detail"),
]

# Anexar las rutas generadas por el router de DRF (/api/gates/ y /api/flights/)
urlpatterns += router.urls