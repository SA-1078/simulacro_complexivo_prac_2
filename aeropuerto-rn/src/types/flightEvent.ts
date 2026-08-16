/**
 * ============================================================================
 * TIPOS: EVENTOS OPERATIVOS (MONGODB - COLECCIÓN FLIGHT_EVENTS)
 * ============================================================================
 * Representa los eventos de auditoría y operaciones generados en MongoDB,
 * vinculando el id relacional del vuelo (PostgreSQL) con la trazabilidad NoSQL.
 */

// Tipos de eventos admitidos por el backend
export type EventType =
  | "CREATED"
  | "BOARDING_STARTED"
  | "DEPARTED"
  | "DELAYED"
  | "CANCELLED";

// Orígenes admitidos para el evento
export type EventSource = "WEB" | "MOBILE" | "SYSTEM";

export type FlightEvent = {
  id: string;               // ObjectId de MongoDB (convertido a string por el backend)
  flight_id: number;        // ID del vuelo en PostgreSQL (relación híbrida SQL-NoSQL)
  event_type: EventType;    // Tipo de evento ocurrido
  source: EventSource;      // Plataforma desde la que se registró el evento
  note?: string;            // Observaciones o notas descriptivas
  created_at?: string;      // Fecha y hora del evento generada en Mongo
};
