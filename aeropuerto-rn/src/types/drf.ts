/**
 * ============================================================================
 * TIPOS: ESTRUCTURA PAGINADA DE DJANGO REST FRAMEWORK Y UTILIDADES
 * ============================================================================
 */

// Estructura de respuesta generada por PageNumberPagination de DRF
export type Paginated<T> = {
  count: number;             // Total de registros disponibles
  next: string | null;       // URL a la siguiente página (si existe)
  previous: string | null;   // URL a la página anterior (si existe)
  results: T[];              // Lista de elementos de la página actual
};

/**
 * Función auxiliar para transformar respuestas del backend en arrays planos seguros.
 * Funciona tanto si el backend responde con objeto paginado ({ results: [...] })
 * como si responde con un array directo ([...]).
 * 
 * @param data Respuesta del endpoint
 * @returns Array plano de elementos de tipo T
 */
export function toArray<T>(data: Paginated<T> | T[]): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  return data?.results || [];
}
