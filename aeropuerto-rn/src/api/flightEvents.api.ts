/**
 * ============================================================================
 * SERVICIO DE EVENTOS DE VUELO (MONGODB - /api/flight_events/)
 * ============================================================================
 * Maneja las operaciones CRUD contra la colección NoSQL 'flight_events',
 * vinculando el id relacional de PostgreSQL con el log operativo.
 */

import { http } from "./http";
import type { FlightEvent, EventType, EventSource } from "../types/flightEvent";

// Payload esperado para crear un evento de vuelo en MongoDB
export type FlightEventCreatePayload = {
  flight_id: number;        // ID del vuelo de PostgreSQL
  event_type: EventType;    // Tipo de evento (CREATED, BOARDING_STARTED, etc.)
  source: EventSource;      // Origen del evento (WEB, MOBILE, SYSTEM)
  note?: string;            // Nota u observación opcional
};

/**
 * Consulta la lista de eventos registrados en MongoDB.
 */
export async function listFlightEventsApi(): Promise<FlightEvent[]> {
  const { data } = await http.get<FlightEvent[]>("/api/flight_events/");
  return data;
}

/**
 * Registra un nuevo evento en MongoDB.
 * El backend valida que el flight_id exista en PostgreSQL antes de insertar.
 * La fecha (created_at) es colocada automáticamente por el backend.
 * 
 * @param payload Datos del evento
 * @returns Documento insertado
 */
export async function createFlightEventApi(payload: FlightEventCreatePayload): Promise<FlightEvent> {
  const { data } = await http.post<FlightEvent>("/api/flight_events/", payload);
  return data;
}

/**
 * Elimina un evento operativo de MongoDB por su ID.
 * 
 * @param id ObjectId en formato string
 */
export async function deleteFlightEventApi(id: string): Promise<void> {
  await http.delete(`/api/flight_events/${id}/`);
}
