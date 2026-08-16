-- ============================================================================
-- EXAMEN COMPLEXIVO PRÁCTICO - CASO AEROPUERTO
-- GUÍA DE COMANDOS SQL (POSTGRESQL) Y NOSQL (MONGODB) CON EVIDENCIAS
-- ============================================================================

-- ============================================================================
-- SECCIÓN 1: BASE DE DATOS RELACIONAL (POSTGRESQL)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- CAPTURA 1: Creación de Base de Datos
-- ----------------------------------------------------------------------------
-- Ingreso a PostgreSQL como superusuario:
-- sudo -u postgres psql

CREATE DATABASE airport_db;
-- (o si en el backend se usa db_aeropuerto):
-- CREATE DATABASE db_aeropuerto;

-- ----------------------------------------------------------------------------
-- CAPTURA 2: Creación de Usuario y Asignación de Permisos
-- ----------------------------------------------------------------------------
-- Crear el usuario backend_user con contraseña segura y sin superusuario:
CREATE USER backend_user WITH PASSWORD 'admin123';
-- (o aeropuerto_user):
CREATE USER aeropuerto_user WITH PASSWORD 'admin123';

-- Conceder la propiedad y permisos de la base de datos:
GRANT ALL PRIVILEGES ON DATABASE airport_db TO backend_user;
ALTER DATABASE airport_db OWNER TO backend_user;

-- Conectar a la base de datos para configurar permisos sobre el esquema public:
\c airport_db

ALTER SCHEMA public OWNER TO backend_user;
GRANT ALL ON SCHEMA public TO backend_user;
GRANT CREATE ON SCHEMA public TO backend_user;

-- Permisos por defecto para futuras tablas, secuencias y funciones creadas:
ALTER DEFAULT PRIVILEGES FOR USER backend_user IN SCHEMA public
GRANT ALL ON TABLES TO backend_user;

ALTER DEFAULT PRIVILEGES FOR USER backend_user IN SCHEMA public
GRANT ALL ON SEQUENCES TO backend_user;

ALTER DEFAULT PRIVILEGES FOR USER backend_user IN SCHEMA public
GRANT ALL ON FUNCTIONS TO backend_user;

-- ----------------------------------------------------------------------------
-- CAPTURA 3: Conexión con el Usuario Creado
-- ----------------------------------------------------------------------------
-- Probar la conexión desde terminal con el usuario creado:
-- psql -h 127.0.0.1 -U backend_user -d airport_db
-- Password: admin123

-- Listar las bases de datos para evidenciar conexión y existencia de airport_db:
\l

-- ----------------------------------------------------------------------------
-- CAPTURA 4: Tablas Generadas por Migración
-- ----------------------------------------------------------------------------
-- Ejecutar migraciones en Django (python manage.py migrate) y luego listar tablas:
\dt

-- ----------------------------------------------------------------------------
-- CAPTURA 5: Estructura Detallada de Tablas Principales
-- ----------------------------------------------------------------------------
-- Ver estructura de la tabla de puertas de embarque (gates):
\d aeropuerto_gates
-- (o \d gates si no tiene prefijo de app Django)

-- Ver estructura de la tabla de vuelos (flights):
\d aeropuerto_flights
-- (o \d flights)

-- DDL de referencia de las tablas (creadas automáticamente por Django):
/*
CREATE TABLE IF NOT EXISTS aeropuerto_gates (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    terminal VARCHAR(20) NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aeropuerto_flights (
    id BIGSERIAL PRIMARY KEY,
    gate_id BIGINT NOT NULL REFERENCES aeropuerto_gates(id) ON DELETE PROTECT,
    flight_number VARCHAR(20) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
*/

-- ----------------------------------------------------------------------------
-- INSERCIÓN DE REGISTROS DE PRUEBA (Mínimo 1 por tabla)
-- ----------------------------------------------------------------------------
-- 1. Insertar puertas de embarque:
INSERT INTO aeropuerto_gates (code, terminal, is_available, created_at)
VALUES 
    ('G01', 'T1', TRUE, NOW()),
    ('G02', 'T1', TRUE, NOW()),
    ('G10', 'T2', FALSE, NOW())
ON CONFLICT (code) DO NOTHING;

-- 2. Insertar vuelos asociados a las puertas:
INSERT INTO aeropuerto_flights (gate_id, flight_number, destination, status, departure_time, created_at)
VALUES 
    (1, 'AA1234', 'Miami (MIA)', 'SCHEDULED', NOW() + INTERVAL '2 hours', NOW()),
    (1, 'IB6400', 'Madrid (MAD)', 'BOARDING', NOW() + INTERVAL '30 minutes', NOW()),
    (2, 'AV8370', 'Bogotá (BOG)', 'DEPARTED', NOW() - INTERVAL '1 hour', NOW()),
    (2, 'LA1420', 'Lima (LIM)', 'DELAYED', NOW() + INTERVAL '4 hours', NOW());

-- Verificar inserciones:
SELECT * FROM aeropuerto_gates;
SELECT * FROM aeropuerto_flights;

-- ----------------------------------------------------------------------------
-- CAPTURA 6: Creación de Índice en flights(status) y Demostración
-- ----------------------------------------------------------------------------
-- Crear índice en la columna status de flights:
CREATE INDEX IF NOT EXISTS idx_flights_status ON aeropuerto_flights (status);

-- Verificar la existencia del índice en la tabla:
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'aeropuerto_flights';

-- Demostrar uso del índice o consulta filtrada con EXPLAIN:
EXPLAIN ANALYZE 
SELECT * FROM aeropuerto_flights 
WHERE status = 'SCHEDULED';

-- ----------------------------------------------------------------------------
-- CAPTURA 7: Creación de Vista vw_active_flights
-- ----------------------------------------------------------------------------
-- Vista que lista vuelos activos (SCHEDULED y BOARDING) con información de puerta:
CREATE OR REPLACE VIEW vw_active_flights AS
SELECT 
    f.id AS flight_id,
    f.flight_number,
    f.destination,
    f.status,
    f.departure_time,
    g.id AS gate_id,
    g.code AS gate_code,
    g.terminal,
    g.is_available AS gate_is_available,
    f.created_at AS flight_created_at
FROM aeropuerto_flights AS f
INNER JOIN aeropuerto_gates AS g ON f.gate_id = g.id
WHERE f.status IN ('SCHEDULED', 'BOARDING');

-- Consulta ejecutada sobre la vista para evidenciar datos:
SELECT * FROM vw_active_flights;

-- ----------------------------------------------------------------------------
-- CAPTURA 8: Función o Trigger
-- ----------------------------------------------------------------------------

-- OPCIÓN A: Función para contar el total de vuelos por estado
CREATE OR REPLACE FUNCTION fn_total_vuelos_por_estado(p_status VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    v_total INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM aeropuerto_flights
    WHERE status = p_status;
    
    RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- Prueba de la función:
SELECT fn_total_vuelos_por_estado('SCHEDULED') AS total_programados;
SELECT fn_total_vuelos_por_estado('BOARDING') AS total_embarcando;

-- OPCIÓN B: Trigger para validar que flight_number no esté vacío
CREATE OR REPLACE FUNCTION fn_validar_flight_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.flight_number IS NULL OR LENGTH(TRIM(NEW.flight_number)) = 0 THEN
        RAISE EXCEPTION 'El número de vuelo no puede estar vacío';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_validar_flight_number
BEFORE INSERT OR UPDATE ON aeropuerto_flights
FOR EACH ROW
EXECUTE FUNCTION fn_validar_flight_number();

-- Prueba del trigger (inserción válida):
INSERT INTO aeropuerto_flights (gate_id, flight_number, destination, status, departure_time, created_at)
VALUES (1, 'EQ301', 'Galápagos (GPS)', 'SCHEDULED', NOW() + INTERVAL '5 hours', NOW());

-- Prueba del trigger que debe fallar (número de vuelo vacío):
-- INSERT INTO aeropuerto_flights (gate_id, flight_number, destination, status, departure_time, created_at)
-- VALUES (1, '   ', 'Quito (UIO)', 'SCHEDULED', NOW() + INTERVAL '1 hour', NOW());


-- ============================================================================
-- SECCIÓN 2: BASE DE DATOS NO RELACIONAL (MONGODB)
-- ============================================================================

-- Ejecutar en terminal: mongosh

/*
// ----------------------------------------------------------------------------
// CAPTURA 9: Creación y Selección de Base de Datos
// ----------------------------------------------------------------------------
use airport_logs;
// (o use db_aeropuerto;)

// ----------------------------------------------------------------------------
// CAPTURA 10: Creación de Usuario con Roles Mínimos
// ----------------------------------------------------------------------------
// Crear usuario mongo_backend_user con contraseña exa_2026_ute y rol readWrite:
db.createUser({
  user: "mongo_backend_user",
  pwd: "exa_2026_ute",
  roles: [
    { role: "readWrite", db: "airport_logs" }
  ]
});

// Autenticación con el usuario creado:
db.auth("mongo_backend_user", "exa_2026_ute");

// ----------------------------------------------------------------------------
// CAPTURA 11: Creación o Verificación de Colecciones e Inserción de Prueba
// ----------------------------------------------------------------------------
// 1. Inserción en colección airlines:
db.airlines.insertMany([
  {
    name: "American Airlines",
    code: "AA",
    country: "Estados Unidos",
    is_active: true,
    created_at: new Date()
  },
  {
    name: "Iberia",
    code: "IB",
    country: "España",
    is_active: true,
    created_at: new Date()
  },
  {
    name: "Avianca",
    code: "AV",
    country: "Colombia",
    is_active: true,
    created_at: new Date()
  },
  {
    name: "LATAM Airlines",
    code: "LA",
    country: "Chile",
    is_active: true,
    created_at: new Date()
  }
]);

// 2. Inserción en colección flight_events vinculando flight_id de PostgreSQL:
db.flight_events.insertMany([
  {
    flight_id: NumberLong(1),
    event_type: "CREATED",
    source: "SYSTEM",
    note: "Vuelo AA1234 programado en puerta G01",
    created_at: new Date()
  },
  {
    flight_id: NumberLong(1),
    event_type: "BOARDING_STARTED",
    source: "WEB",
    note: "Inicio de embarque de pasajeros en puerta G01",
    created_at: new Date()
  },
  {
    flight_id: NumberLong(2),
    event_type: "CREATED",
    source: "MOBILE",
    note: "Vuelo IB6400 registrado desde terminal móvil de operaciones",
    created_at: new Date()
  },
  {
    flight_id: NumberLong(3),
    event_type: "DEPARTED",
    source: "SYSTEM",
    note: "Vuelo AV8370 despegó a tiempo",
    created_at: new Date()
  }
]);

// Listar colecciones creadas:
show collections;

// Mostrar documentos insertados:
db.airlines.find().pretty();
db.flight_events.find().pretty();

// ----------------------------------------------------------------------------
// CAPTURA 12: Creación de Índice en flight_events(flight_id)
// ----------------------------------------------------------------------------
// Crear índice ascendente sobre el campo flight_id:
db.flight_events.createIndex({ flight_id: 1 });

// Evidenciar índices creados:
db.flight_events.getIndexes();

// ----------------------------------------------------------------------------
// CAPTURA 13: Consulta por Identificador (flight_id)
// ----------------------------------------------------------------------------
// Buscar todos los eventos del vuelo con ID 1 (relacionado con PostgreSQL):
db.flight_events.find({ flight_id: NumberLong(1) }).pretty();

// ----------------------------------------------------------------------------
// CAPTURA 14: Consulta por Rango de Fechas (created_at)
// ----------------------------------------------------------------------------
// Consultar eventos creados en un rango de fechas (últimas 24 horas):
db.flight_events.find({
  created_at: {
    $gte: new Date(new Date().setDate(new Date().getDate() - 1)),
    $lte: new Date(new Date().setDate(new Date().getDate() + 1))
  }
}).pretty();

*/
