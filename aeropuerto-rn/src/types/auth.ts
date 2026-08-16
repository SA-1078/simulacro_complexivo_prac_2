/**
 * ============================================================================
 * TIPOS: AUTENTICACIÓN JWT (DJANGO SIMPLE JWT)
 * ============================================================================
 */

// Par de tokens JWT devueltos por el endpoint /api/auth/login/
export type TokenPair = {
  access: string;   // Token de acceso para cabeceras HTTP (Authorization: Bearer <token>)
  refresh: string;  // Token de refresco para renovar la sesión
};
