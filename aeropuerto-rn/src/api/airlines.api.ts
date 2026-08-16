/**
 * ============================================================================
 * SERVICIO DE AEROLÍNEAS (MONGODB - /api/airlines/)
 * ============================================================================
 * Maneja las operaciones CRUD contra la colección NoSQL 'airlines'.
 */

import { http } from "./http";
import type { Airline } from "../types/airline";

// Payload esperado para registrar una nueva aerolínea en MongoDB
export type AirlineCreatePayload = {
  name: string;
  code: string;
  country: string;
  is_active: boolean;
};

/**
 * Obtiene todas las aerolíneas almacenadas en MongoDB.
 */
export async function listAirlinesApi(): Promise<Airline[]> {
  const { data } = await http.get<Airline[]>("/api/airlines/");
  return data;
}

/**
 * Registra una nueva aerolínea en la base de datos MongoDB.
 * 
 * @param payload Datos de la aerolínea
 * @returns Documento creado con su ObjectId
 */
export async function createAirlineApi(payload: AirlineCreatePayload): Promise<Airline> {
  const { data } = await http.post<Airline>("/api/airlines/", payload);
  return data;
}

/**
 * Elimina una aerolínea de MongoDB por su ID.
 * 
 * @param id ObjectId en formato string
 */
export async function deleteAirlineApi(id: string): Promise<void> {
  await http.delete(`/api/airlines/${id}/`);
}
