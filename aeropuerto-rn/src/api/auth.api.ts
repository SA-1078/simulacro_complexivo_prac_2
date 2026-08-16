/**
 * ============================================================================
 * SERVICIO DE AUTENTICACIÓN (POST /api/auth/login/)
 * ============================================================================
 */

import { http } from "./http";
import type { TokenPair } from "../types/auth";

/**
 * Autentica un usuario con el backend Django REST Framework usando Simple JWT.
 * 
 * @param username Nombre de usuario registrado (ej: superusuario o staff)
 * @param password Contraseña en texto plano
 * @returns Objeto con tokens { access, refresh }
 */
export async function loginApi(username: string, password: string): Promise<TokenPair> {
  const { data } = await http.post<TokenPair>("/api/auth/login/", {
    username,
    password,
  });
  return data;
}
