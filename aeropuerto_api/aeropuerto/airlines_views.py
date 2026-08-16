"""
================================================================================
CONTROLADORES NOSQL (MONGODB) - AEROLÍNEAS (/api/airlines/)
================================================================================
Gestiona las operaciones CRUD directamente sobre la colección 'airlines' de MongoDB:
- GET /api/airlines/ : Listar con filtros (?country, ?is_active, ?code, ?name)
- POST /api/airlines/ : Registrar nueva aerolínea
- GET /api/airlines/<id>/ : Obtener detalle por ObjectId
- PUT / PATCH /api/airlines/<id>/ : Actualizar aerolínea
- DELETE /api/airlines/<id>/ : Eliminar aerolínea
"""

from datetime import datetime, timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from bson import ObjectId
from bson.errors import InvalidId

from .mongo import db
from .mongo_serializers import AirlinesSerializer

# Referencia directa a la colección 'airlines' en MongoDB
col = db["airlines"]


def fix_id(doc):
    """
    Convierte el campo '_id' de tipo ObjectId a un campo 'id' de tipo string,
    haciéndolo compatible con los estándares de serialización JSON del frontend.
    """
    if not doc:
        return doc
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc


def oid_or_none(id_str: str):
    """
    Intenta convertir un string hexadecimal a ObjectId de BSON.
    Si el formato es inválido, retorna None de forma segura.
    """
    try:
        return ObjectId(id_str)
    except InvalidId:
        return None


# ============================================================================
# ENDPOINT: Listar y Crear Aerolíneas (GET / POST)
# ============================================================================
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def airlines_list_create(request):
    # OPERACIÓN GET: Listar con filtros opcionales
    if request.method == "GET":
        q = {}
        for k, v in request.query_params.items():
            if k == "is_active":
                q[k] = v.lower() in ["true", "1", "t"]
            elif k in ["name", "code", "country"]:
                q[k] = v

        # Ordenar alfabéticamente por nombre
        docs = [fix_id(d) for d in col.find(q).sort("name", 1)]
        return Response(docs)

    # OPERACIÓN POST: Crear documento en MongoDB
    serializer = AirlinesSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data
    # Asignar timestamp actual en UTC si no fue provisto
    if "created_at" not in data or data["created_at"] is None:
        data["created_at"] = datetime.now(timezone.utc)

    res = col.insert_one(data)
    doc = col.find_one({"_id": res.inserted_id})
    return Response(fix_id(doc), status=status.HTTP_201_CREATED)


# ============================================================================
# ENDPOINT: Detalle, Modificar y Eliminar Aerolínea (GET / PUT / PATCH / DELETE)
# ============================================================================
@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def airlines_detail(request, id: str):
    _id = oid_or_none(id)
    if _id is None:
        return Response({"detail": "ID de MongoDB inválido."}, status=status.HTTP_400_BAD_REQUEST)

    # OPERACIÓN GET: Detalle
    if request.method == "GET":
        doc = col.find_one({"_id": _id})
        if not doc:
            return Response({"detail": "Aerolínea no encontrada."}, status=status.HTTP_404_NOT_FOUND)
        return Response(fix_id(doc))

    # OPERACIÓN PUT / PATCH: Actualizar
    if request.method in ["PUT", "PATCH"]:
        serializer = AirlinesSerializer(data=request.data, partial=(request.method == "PATCH"))
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        col.update_one({"_id": _id}, {"$set": data})
        doc = col.find_one({"_id": _id})
        if not doc:
            return Response({"detail": "Aerolínea no encontrada."}, status=status.HTTP_404_NOT_FOUND)
        return Response(fix_id(doc))

    # OPERACIÓN DELETE: Eliminar
    res = col.delete_one({"_id": _id})
    if res.deleted_count == 0:
        return Response({"detail": "Aerolínea no encontrada."}, status=status.HTTP_404_NOT_FOUND)
    return Response(status=status.HTTP_204_NO_CONTENT)