"""
================================================================================
CONTROLADORES NOSQL (MONGODB) - EVENTOS OPERATIVOS (/api/flight_events/)
================================================================================
Gestiona las operaciones CRUD sobre la colección 'flight_events' en MongoDB,
garantizando la integridad referencial híbrida con PostgreSQL (validando que
el flight_id exista en la tabla relacional Flights antes de insertar o editar).
"""

from datetime import datetime, timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from bson import ObjectId
from bson.errors import InvalidId

from .mongo import db
from .mongo_serializers import Flight_EventsSerializer
from .models import Flights

# Referencia a la colección 'flight_events' en MongoDB
col = db["flight_events"]

def fix_id(doc):
    # Convierte el id de mongo a string y deja el doc en formato postgres
    if not doc:
        return doc
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

def oid_or_none(id_str: str):
    # Intenta convertir el id de mongo a ObjectId, si no es valido devuelve None
    try:
        return ObjectId(id_str)
    except InvalidId:
        return None


# ============================================================================
# ENDPOINT: Listar y Crear Eventos Operativos (GET / POST)
# ============================================================================
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def flight_events_list_create(request):
    # OPERACIÓN GET: Listar eventos con filtros opcionales
    if request.method == "GET":
        # Filtros simples: ?event_type=landed&source=gate para validar mongo y postgres
        # Se crea un diccionario q para almacenar los filtros que se van a usar
        q = {}
        # Se recorre el query_params para obtener los filtros
        for k, v in request.query_params.items():
            if k == "flight_id":
                try:
                    q[k] = int(v)
                except ValueError:
                    pass
            elif k in ["event_type", "source"]:
                q[k] = v
        # Se recorre el query_params para obtener los filtros
        # Se ordenan los resultados por fecha de creacion en orden descendente
        docs = [fix_id(d) for d in col.find(q).sort("created_at", -1)]
        return Response(docs)

    # OPERACIÓN POST: Crear evento validando integridad referencial con PostgreSQL
    serializer = Flight_EventsSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data
    # Validación de integridad referencial con PostgreSQL (validando id's de vuelos de postgres)
    flight_id = data["flight_id"]
    if not Flights.objects.filter(id=flight_id).exists():
        return Response(
            {"flight_id": f"El vuelo con ID {flight_id} no existe en PostgreSQL."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Asignar fecha actual en UTC si no fue enviada
    if "created_at" not in data or data["created_at"] is None:
        data["created_at"] = datetime.now(timezone.utc)
    # Se inserta el documento en mongo
    res = col.insert_one(data)
    # Se busca el documento insertado
    doc = col.find_one({"_id": res.inserted_id})
    return Response(fix_id(doc), status=status.HTTP_201_CREATED)


# ============================================================================
# ENDPOINT: Detalle, Modificar y Eliminar Evento (GET / PUT / PATCH / DELETE)
# ============================================================================
@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def flight_events_detail(request, id: str):
    _id = oid_or_none(id)
    if _id is None:
        return Response({"detail": "ID de evento inválido."}, status=status.HTTP_400_BAD_REQUEST)

    # OPERACIÓN GET: Detalle
    if request.method == "GET":
        doc = col.find_one({"_id": _id})
        if not doc:
            return Response({"detail": "Evento no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        return Response(fix_id(doc))

    # OPERACIÓN PUT / PATCH: Modificar
    if request.method in ["PUT", "PATCH"]:
        serializer = Flight_EventsSerializer(data=request.data, partial=(request.method == "PATCH"))
        serializer.is_valid(raise_exception=True)
        # Actualizar estado del vuelo 
        data = serializer.validated_data
        # Si se actualiza el flight_id, validar que exista en PostgreSQL
        if "flight_id" in data:
            if not Flights.objects.filter(id=data["flight_id"]).exists():
                return Response(
                    {"flight_id": f"El vuelo con ID {data['flight_id']} no existe en PostgreSQL."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        # Se actualiza el documento en mongo
        col.update_one({"_id": _id}, {"$set": data})
        # Se busca el documento actualizado
        doc = col.find_one({"_id": _id})
        if not doc:
            return Response({"detail": "Evento no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        return Response(fix_id(doc))

    # OPERACIÓN DELETE: Eliminar
    res = col.delete_one({"_id": _id})
    if res.deleted_count == 0:
        return Response({"detail": "Evento no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    return Response(status=status.HTTP_204_NO_CONTENT)