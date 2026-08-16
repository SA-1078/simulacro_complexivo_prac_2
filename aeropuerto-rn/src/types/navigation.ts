/**
 * ============================================================================
 * TIPOS: RUTAS DE NAVEGACIÓN (REACT NAVIGATION NATIVE STACK)
 * ============================================================================
 * Define las pantallas y los parámetros aceptados por el stack principal.
 */

export type RootStackParamList = {
  Login: undefined;         // Pantalla de autenticación JWT
  Home: undefined;          // Menú principal con accesos directos
  Airlines: undefined;      // Pantalla de gestión CRUD de Aerolíneas (MongoDB)
  FlightEvents: undefined;  // Pantalla de gestión CRUD de Eventos (MongoDB + Selects)
};
