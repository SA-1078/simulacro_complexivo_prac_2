-- ============================================================================
-- REFERENCIA DE TABLAS Y COLECCIONES USADAS POR EL BACKEND (DJANGO / API):
-- ============================================================================
/*
Tablas PostgreSQL del Backend (2):
1. gates / aeropuerto_gates (puertas de embarque)
2. flights / aeropuerto_flights (vuelos programados)

Colecciones MongoDB del Backend (2):
1. airlines (aerolíneas registradas)
2. flight_events (eventos operativos de vuelos)
*/

-- TABLAS POSTGRESQL (2 TABLAS)
-- Tabla aeropuerto_gates (puertas de embarque)

CREATE TABLE IF NOT EXISTS aeropuerto_gates (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    nombre_puerta VARCHAR(50) NOT NULL,
    capacidad_personas INTEGER NOT NULL DEFAULT 150,
    tipo_puerta VARCHAR(30) NOT NULL DEFAULT '2D ESTANDAR',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla aeropuerto_flights (vuelos programados)

CREATE TABLE IF NOT EXISTS aeropuerto_flights (
    id BIGSERIAL PRIMARY KEY,
    codigo_vuelo VARCHAR(10) NOT NULL UNIQUE,
    aerolinea VARCHAR(50) NOT NULL,
    origen VARCHAR(40) NOT NULL,
    destino VARCHAR(40) NOT NULL,
    hora_programada TIMESTAMP NOT NULL,
    gate_id BIGINT REFERENCES aeropuerto_gates(id) ON DELETE SET NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PROGRAMADO',
    creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- COLECCIONES MONGODB (2 COLECCIONES)

-- COLECCION airlines (aerolíneas registradas)
/*
_id ObjectId
airline_name string
iata_code string (unique)
country string
is_active boolean
*/

-- COLECCION flight_events (eventos operativos de vuelos)
/*
_id ObjectId
flight_id ObjectId (referencia a airlines)
event_type string (SCHEDULED, BOARDING, DELAYED, CANCELLED, GATE_CHANGE, ARRIVED)
source string (WEB, MOBILE, AIRPORT_STAFF)
note string
created_at date
*/

-- ============================================================================
-- EXAMEN COMPLEXIVO PRÁCTICO - CASO AEROPUERTO
-- GUÍA DE COMANDOS SQL (POSTGRESQL) Y NOSQL (MONGODB) CON EVIDENCIAS
-- (TABLAS Y COLECCIONES INDEPENDIENTES PARA PRUEBAS Y CAPTURAS DEL EXAMEN)
-- ============================================================================

-- ============================================================================
-- SECCIÓN 1: BASE DE DATOS RELACIONAL (POSTGRESQL) - CAPTURAS 1 A 8
-- ============================================================================

-- ----------------------------------------------------------------------------
-- CAPTURA 1: Creación de Base de Datos
-- ----------------------------------------------------------------------------
-- Ingreso a PostgreSQL como superusuario:
-- sudo -u postgres psql

CREATE DATABASE airport_db;

-- ----------------------------------------------------------------------------
-- CAPTURA 2: Creación de Usuario y Asignación de Permisos (No Superusuario)
-- ----------------------------------------------------------------------------
CREATE USER backend_user WITH PASSWORD 'admin123';

GRANT ALL PRIVILEGES ON DATABASE airport_db TO backend_user;
ALTER DATABASE airport_db OWNER TO backend_user;

-- Conectar a la base de datos para configurar permisos sobre el esquema public:
\c airport_db

ALTER SCHEMA public OWNER TO backend_user;
GRANT ALL ON SCHEMA public TO backend_user;
GRANT CREATE ON SCHEMA public TO backend_user;

ALTER DEFAULT PRIVILEGES FOR USER backend_user IN SCHEMA public
GRANT ALL ON TABLES TO backend_user;

ALTER DEFAULT PRIVILEGES FOR USER backend_user IN SCHEMA public
GRANT ALL ON SEQUENCES TO backend_user;

ALTER DEFAULT PRIVILEGES FOR USER backend_user IN SCHEMA public
GRANT ALL ON FUNCTIONS TO backend_user;

\q

-- ----------------------------------------------------------------------------
-- CAPTURA 3: Conexión con el Usuario Creado
-- ----------------------------------------------------------------------------
-- Probar la conexión desde terminal con el usuario creado:
-- psql -h 127.0.0.1 -U backend_user -d airport_db
-- Password: admin123

-- Listar las bases de datos para evidenciar conexión y existencia de airport_db:
\l

-- ----------------------------------------------------------------------------
-- CAPTURA 4 y 5: Creación de Tablas Independientes con Relaciones (FK)
-- (Independientes del API: hangares_aeropuerto y mantenimientos_aeronaves)
-- ----------------------------------------------------------------------------

-- Tabla Principal 1: hangares_aeropuerto
CREATE TABLE IF NOT EXISTS hangares_aeropuerto (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    capacidad_aeronaves INTEGER NOT NULL DEFAULT 2,
    ubicacion VARCHAR(40) NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla Dependiente 2: mantenimientos_aeronaves (con FK a hangares_aeropuerto)
CREATE TABLE IF NOT EXISTS mantenimientos_aeronaves (
    id BIGSERIAL PRIMARY KEY,
    hangar_id BIGINT NOT NULL REFERENCES hangares_aeropuerto(id) ON DELETE PROTECT,
    matricula_avion VARCHAR(20) NOT NULL,
    tecnico_lider VARCHAR(120) NOT NULL,
    costo_estimado NUMERIC(10,2) NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('PROGRAMADO', 'EN_REVISION', 'FINALIZADO', 'CANCELADO')),
    creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Listar tablas creadas:
\dt

-- Ver estructura detallada y relaciones (FK):
\d hangares_aeropuerto
\d mantenimientos_aeronaves

-- ----------------------------------------------------------------------------
-- INSERCIÓN DE REGISTROS DE PRUEBA (Mínimo 1 por tabla)
-- ----------------------------------------------------------------------------
-- 1. Insertar hangares:
INSERT INTO hangares_aeropuerto (codigo, capacidad_aeronaves, ubicacion)
VALUES 
    ('HANG-A1', 4, 'Zona Norte - Pista 1'),
    ('HANG-B2', 2, 'Zona Sur - Pista 2'),
    ('HANG-C3', 1, 'Zona Este - Carga')
ON CONFLICT (codigo) DO NOTHING;

-- 2. Insertar mantenimientos vinculados a hangares:
INSERT INTO mantenimientos_aeronaves (hangar_id, matricula_avion, tecnico_lider, costo_estimado, estado, creado_en)
VALUES 
    (1, 'HC-CPR', 'Ing. Roberto Paz', 3500.00, 'EN_REVISION', NOW() - INTERVAL '2 days'),
    (1, 'HC-BZR', 'Ing. Roberto Paz', 1200.00, 'PROGRAMADO', NOW() - INTERVAL '1 day'),
    (2, 'N123AA', 'Ing. Sandra Ramos', 5400.00, 'FINALIZADO', NOW() - INTERVAL '5 days'),
    (3, 'HC-CVA', 'Ing. Mario Viteri', 800.00, 'CANCELADO', NOW() - INTERVAL '3 days');

-- Verificar registros:
SELECT * FROM hangares_aeropuerto;
SELECT * FROM mantenimientos_aeronaves;

-- ----------------------------------------------------------------------------
-- CAPTURA 6: Creación de Índice en campo frecuente y Demostración con EXPLAIN
-- ----------------------------------------------------------------------------
-- Crear índice en la columna 'estado' de mantenimientos_aeronaves:
CREATE INDEX IF NOT EXISTS idx_mantenimientos_estado ON mantenimientos_aeronaves (estado);

-- Verificar la existencia del índice:
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'mantenimientos_aeronaves';

-- Demostrar el uso del índice con EXPLAIN ANALYZE:
EXPLAIN ANALYZE 
SELECT * FROM mantenimientos_aeronaves 
WHERE estado = 'EN_REVISION';

-- ----------------------------------------------------------------------------
-- CAPTURA 7: Creación de Vista que Filtra por Subconjunto de Estados
-- ----------------------------------------------------------------------------
-- Vista que lista mantenimientos activos (PROGRAMADO y EN_REVISION) con datos del hangar:
CREATE OR REPLACE VIEW vw_mantenimientos_activos AS
SELECT 
    m.id AS mantenimiento_id,
    m.matricula_avion,
    m.tecnico_lider,
    m.costo_estimado,
    m.estado,
    h.codigo AS codigo_hangar,
    h.ubicacion,
    m.creado_en AS fecha_mantenimiento
FROM mantenimientos_aeronaves m
INNER JOIN hangares_aeropuerto h ON m.hangar_id = h.id
WHERE m.estado IN ('PROGRAMADO', 'EN_REVISION');

-- Consulta ejecutada sobre la vista:
SELECT * FROM vw_mantenimientos_activos;

-- ----------------------------------------------------------------------------
-- CAPTURA 8: Función o Trigger con Regla de Integridad del Dominio
-- ----------------------------------------------------------------------------

-- OPCIÓN A: Función almacenada para contar total de mantenimientos por estado
CREATE OR REPLACE FUNCTION fn_total_mantenimientos_por_estado(p_estado VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    v_total INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM mantenimientos_aeronaves
    WHERE estado = UPPER(p_estado);
    
    RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- Probar la función:
SELECT fn_total_mantenimientos_por_estado('EN_REVISION') AS total_en_revision;
SELECT fn_total_mantenimientos_por_estado('PROGRAMADO') AS total_programados;

-- OPCIÓN B: Trigger para validar que el costo estimado sea mayor a 0
CREATE OR REPLACE FUNCTION fn_validar_costo_mantenimiento()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.costo_estimado <= 0 THEN
        RAISE EXCEPTION 'El costo estimado del mantenimiento debe ser mayor a $0.00 (Recibido: %)', NEW.costo_estimado;
    END IF;
    -- Normalizar matrícula y estado a mayúsculas
    NEW.matricula_avion := UPPER(TRIM(NEW.matricula_avion));
    NEW.estado := UPPER(TRIM(NEW.estado));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_validar_costo_mantenimiento
BEFORE INSERT OR UPDATE ON mantenimientos_aeronaves
FOR EACH ROW
EXECUTE FUNCTION fn_validar_costo_mantenimiento();

-- Prueba del trigger con inserción válida:
INSERT INTO mantenimientos_aeronaves (hangar_id, matricula_avion, tecnico_lider, costo_estimado, estado, creado_en)
VALUES (1, 'hc-new', 'Ing. Especialista', 2500.00, 'PROGRAMADO', NOW());

-- Prueba del trigger que debe fallar (costo_estimado <= 0):
-- INSERT INTO mantenimientos_aeronaves (hangar_id, matricula_avion, tecnico_lider, costo_estimado, estado, creado_en)
-- VALUES (1, 'HC-ERR', 'Ing. Especialista', 0.00, 'PROGRAMADO', NOW());


-- ============================================================================
-- SECCIÓN 2: BASE DE DATOS NO RELACIONAL (MONGODB) - CAPTURAS 9 A 14
-- (COLECCIONES INDEPENDIENTES PARA PRUEBAS Y EVIDENCIAS DEL EXAMEN)
-- ============================================================================

-- Ejecutar en terminal: mongosh

/*
// ----------------------------------------------------------------------------
// CAPTURA 9: Creación y Selección de Base de Datos
// ----------------------------------------------------------------------------
use airport_logs;

// ----------------------------------------------------------------------------
// CAPTURA 10: Creación de Usuario con Roles Mínimos de Lectura/Escritura
// ----------------------------------------------------------------------------
db.createUser({
  user: "mongo_backend_user",
  pwd: "exa_2026_ute",
  roles: [
    { role: "readWrite", db: "airport_logs" }
  ]
});

// Prueba de autenticación con el usuario creado:
db.auth("mongo_backend_user", "exa_2026_ute");

// ----------------------------------------------------------------------------
// CAPTURA 11: Definición de Colecciones Independientes e Inserción de Prueba
// ----------------------------------------------------------------------------
// 1. Inserción en colección aeronaves_catalogo (Independiente):
db.aeronaves_catalogo.insertMany([
  {
    modelo: "Boeing 737-800",
    fabricante: "Boeing",
    capacidad_pasajeros: 189,
    alcance_km: 5765,
    is_active: true,
    created_at: new Date()
  },
  {
    modelo: "Airbus A320neo",
    fabricante: "Airbus",
    capacidad_pasajeros: 180,
    alcance_km: 6300,
    is_active: true,
    created_at: new Date()
  },
  {
    modelo: "Embraer E195-E2",
    fabricante: "Embraer",
    capacidad_pasajeros: 132,
    alcance_km: 4815,
    is_active: true,
    created_at: new Date()
  }
]);

// 2. Inserción en colección mantenimientos_bitacora (vinculando mantenimiento_id de SQL):
db.mantenimientos_bitacora.insertMany([
  {
    mantenimiento_id: NumberLong(1),
    event_type: "INSPECCION_INICIAL",
    source: "SYSTEM",
    note: "Aeronave HC-CPR ingresó al Hangar A1 para revisión tipo C",
    created_at: new Date("2026-08-15T08:00:00Z")
  },
  {
    mantenimiento_id: NumberLong(1),
    event_type: "CAMBIO_COMPONENTES",
    source: "MOBILE",
    note: "Reemplazo de sensores de presión estática completado",
    created_at: new Date("2026-08-15T14:30:00Z")
  },
  {
    mantenimiento_id: NumberLong(1),
    event_type: "PRUEBA_SISTEMAS",
    source: "WEB",
    note: "Encendido de aviónica y prueba de hidráulicos aprobada",
    created_at: new Date("2026-08-15T18:00:00Z")
  },
  {
    mantenimiento_id: NumberLong(2),
    event_type: "INSPECCION_INICIAL",
    source: "MOBILE",
    note: "Revisión rutinaria de tren de aterrizaje registrada desde tablet",
    created_at: new Date("2026-08-16T09:00:00Z")
  },
  {
    mantenimiento_id: NumberLong(3),
    event_type: "CERTIFICADO_EMITIDO",
    source: "SYSTEM",
    note: "Aeronave liberada para vuelo comercial con certificación DGAC",
    created_at: new Date("2026-08-14T17:00:00Z")
  }
]);

// Listar colecciones creadas:
show collections;

// Mostrar documentos insertados:
db.aeronaves_catalogo.find().pretty();
db.mantenimientos_bitacora.find().pretty();

// ----------------------------------------------------------------------------
// CAPTURA 12: Creación de Índice sobre el campo que referencia a SQL (mantenimiento_id)
// ----------------------------------------------------------------------------
db.mantenimientos_bitacora.createIndex({ mantenimiento_id: 1 });

// Evidenciar índices creados con getIndexes():
db.mantenimientos_bitacora.getIndexes();

// ----------------------------------------------------------------------------
// CAPTURA 13: Consulta por Campo Clave (mantenimiento_id)
// ----------------------------------------------------------------------------
db.mantenimientos_bitacora.find({ mantenimiento_id: NumberLong(1) }).pretty();

// ----------------------------------------------------------------------------
// CAPTURA 14: Consulta por Rango de Fechas (created_at)
// ----------------------------------------------------------------------------
db.mantenimientos_bitacora.find({
  created_at: {
    $gte: new Date("2026-08-14T00:00:00Z"),
    $lte: new Date("2026-08-16T23:59:59Z")
  }
}).pretty();

*/
