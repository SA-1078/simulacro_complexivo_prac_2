/**
 * ============================================================================
 * SERVICIO API: PUERTAS DE EMBARQUE (GATES - POSTGRESQL)
 * ============================================================================
 * Maneja las peticiones HTTP contra /api/gates/ usando Axios.
 */

import { http } from "./http";

// Estructura paginada devuelta por DRF
export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

// Modelo TypeScript de Puertas de Embarque
export type Gates = { 
  id: number; 
  code: string;
  terminal: string;
  is_available: boolean;
  created_at: string;
};

/**
 * Consulta la lista paginada de puertas de embarque (Público).
 */
export async function listGatesApi() {
  const { data } = await http.get<Paginated<Gates>>("/api/gates/");
  return data;
}

/**
 * Registra una nueva puerta en PostgreSQL (Requiere Token Admin).
 */
export async function createGateApi(payload: Omit<Gates, "id" | "created_at">) {
  const { data } = await http.post<Gates>("/api/gates/", payload);
  return data;
}

/**
 * Actualiza parcialmente una puerta existente mediante PATCH (Requiere Token Admin).
 */
export async function updateGateApi(id: number, payload: Partial<Omit<Gates, "id" | "created_at">>) {
  const { data } = await http.patch<Gates>(`/api/gates/${id}/`, payload);
  return data;
}

/**
 * Elimina una puerta de embarque por su ID (Requiere Token Admin).
 */
export async function deleteGateApi(id: number) {
  await http.delete(`/api/gates/${id}/`);
}