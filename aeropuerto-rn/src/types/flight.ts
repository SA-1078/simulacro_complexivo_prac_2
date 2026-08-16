/**
 * ============================================================================
 * TIPOS: VUELOS (POSTGRESQL - TABLA FLIGHTS)
 * ============================================================================
 * Representa los vuelos registrados en la base de datos relacional PostgreSQL.
 * Se consumen en la app móvil para poblar el Picker (Select) de selección de vuelo.
 */

export type FlightStatus =
  | "SCHEDULED"
  | "BOARDING"
  | "DEPARTED"
  | "DELAYED"
  | "CANCELLED";

export type Flight = {
  id: number;                 // Clave primaria relacional (BIGSERIAL)
  gate_id: number;            // ID de la puerta de embarque asociada
  flight_number: string;      // Código del vuelo (ej: "AA1234")
  destination: string;        // Ciudad/aeropuerto de destino
  status: FlightStatus;       // Estado operativo del vuelo
  departure_time: string;     // Fecha y hora estimada de salida (ISO 8601)
  created_at: string;         // Timestamp de registro en PostgreSQL
};
