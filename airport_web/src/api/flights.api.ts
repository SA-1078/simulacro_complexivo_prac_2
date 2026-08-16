/**
 * ============================================================================
 * SERVICIO API: VUELOS (FLIGHTS - POSTGRESQL)
 * ============================================================================
 * Maneja las peticiones HTTP contra /api/flights/ usando Axios.
 */

import { http } from "./http";

// Estados válidos del vuelo
export type FlightStatus =
  | "SCHEDULED"
  | "BOARDING"
  | "DEPARTED"
  | "DELAYED"
  | "CANCELLED";

// Estructura paginada de DRF
export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

// Modelo TypeScript de Vuelo
export type Flight = {
  id: number;
  gate_id: number;
  flight_number: string;
  destination: string;
  status: FlightStatus;
  departure_time: string;
  created_at: string;
};

/**
 * Consulta la lista pública de vuelos (Público).
 */
export async function listFlightsPublicApi() {
  const { data } = await http.get<Paginated<Flight>>("/api/flights/");
  return data;
}

/**
 * Consulta la lista de vuelos para el panel administrativo.
 */
export async function listFlightsAdminApi() {
  const { data } = await http.get<Paginated<Flight>>("/api/flights/");
  return data;
}

export type FlightPayload = Omit<Flight, "id" | "created_at">;

/**
 * Crea un vuelo en PostgreSQL e inserta el evento inicial en MongoDB (Requiere Token Admin).
 */
export async function createFlightApi(payload: FlightPayload) {
  const { data } = await http.post<Flight>("/api/flights/", payload);
  return data;
}

/**
 * Actualiza parcialmente un vuelo existente mediante PATCH (Requiere Token Admin).
 */
export async function updateFlightApi(id: number, payload: Partial<FlightPayload>) {
  const { data } = await http.patch<Flight>(`/api/flights/${id}/`, payload);
  return data;
}

/**
 * Elimina un vuelo por su ID (Requiere Token Admin).
 */
export async function deleteFlightApi(id: number) {
  await http.delete(`/api/flights/${id}/`);
}