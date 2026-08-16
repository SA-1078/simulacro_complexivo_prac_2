/**
 * ============================================================================
 * SERVICIO API: AUTENTICACIÓN JWT (AUTH - BACKEND DRF)
 * ============================================================================
 * Maneja el inicio de sesión contra /api/auth/login/.
 */

import { http } from "./http";

/**
 * Solicita el par de tokens JWT (access y refresh) enviando credenciales.
 */
export async function loginApi(username: string, password: string) {
  const { data } = await http.post("/api/auth/login/", { username, password });
  return data as { access: string; refresh: string };
}