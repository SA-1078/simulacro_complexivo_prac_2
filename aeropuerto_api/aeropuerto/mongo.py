"""
================================================================================
CONEXIÓN A BASE DE DATOS NOSQL (MONGODB) VIA PYMONGO
================================================================================
Instancia el cliente Singleton de PyMongo y expone el objeto 'db' para
acceder a las colecciones 'airlines' y 'flight_events'.
"""

from django.conf import settings
from pymongo import MongoClient

# Cliente de conexión a MongoDB
_client = MongoClient(settings.MONGO_URI)

# Instancia de la base de datos (db_aeropuerto o airport_logs)
db = _client[settings.MONGO_DB]