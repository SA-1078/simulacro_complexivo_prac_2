/**
 * ============================================================================
 * SERVICIO DE VUELOS (POSTGRESQL - GET /api/flights/)
 * ============================================================================
 * Permite obtener los vuelos registrados en PostgreSQL para alimentar el Picker (Select)
 * al momento de crear un evento operativo en MongoDB.
 */

import { http } from "./http";
import type { Flight } from "../types/flight";
import type { Paginated } from "../types/drf";

/**
 * Consulta la lista de vuelos desde PostgreSQL.
 * @returns Lista paginada o array directo de vuelos
 */
export async function listFlightsApi(): Promise<Paginated<Flight> | Flight[]> {
  const { data } = await http.get<Paginated<Flight> | Flight[]>("/api/flights/");
  return data;
}
