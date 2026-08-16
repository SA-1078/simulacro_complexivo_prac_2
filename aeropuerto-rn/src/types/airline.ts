/**
 * ============================================================================
 * TIPOS: AEROLÍNEAS (MONGODB - COLECCIÓN AIRLINES)
 * ============================================================================
 * Representa los documentos de aerolíneas almacenados en la base de datos NoSQL.
 */

export type Airline = {
  id: string;          // Identificador único (ObjectId de MongoDB convertido a string)
  name: string;        // Nombre comercial de la aerolínea (ej: "American Airlines")
  code: string;        // Código IATA de la aerolínea (ej: "AA", "IB")
  country: string;     // País de origen de la aerolínea
  is_active: boolean;  // Estado de actividad de la aerolínea
  created_at?: string; // Fecha de creación asignada por MongoDB
};
