/**
 * ============================================================================
 * PANTALLA: CRUD DE AEROLÍNEAS (MONGODB - COLECCIÓN AIRLINES)
 * ============================================================================
 * Cumple con los requerimientos de evaluación:
 * - Listado de documentos desde MongoDB (GET /api/airlines/)
 * - Creación de nueva aerolínea (POST /api/airlines/) con Switch nativo para is_active
 * - Eliminación de aerolínea (DELETE /api/airlines/:id/)
 * - Manejo de estados de carga (ActivityIndicator) y errores de conexión
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";

import {
  listAirlinesApi,
  createAirlineApi,
  deleteAirlineApi,
} from "../api/airlines.api";
import type { Airline } from "../types/airline";

export default function AirlinesScreen() {
  // Estados de datos y UI
  const [items, setItems] = useState<Airline[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [country, setCountry] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Carga la lista de aerolíneas desde el backend NoSQL.
   */
  const loadAirlines = async (): Promise<void> => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await listAirlinesApi();
      setItems(data || []);
    } catch {
      setErrorMessage("No se pudo cargar aerolíneas. Verifique conexión y token.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAirlines();
  }, []);

  /**
   * Envía la petición para registrar una nueva aerolínea en MongoDB.
   */
  const handleCreateAirline = async (): Promise<void> => {
    try {
      setErrorMessage("");

      // Validaciones básicas de campos obligatorios
      if (!name.trim()) return setErrorMessage("El nombre de la aerolínea es obligatorio.");
      if (!code.trim()) return setErrorMessage("El código IATA es obligatorio (ej. AA).");
      if (!country.trim()) return setErrorMessage("El país es obligatorio.");

      setActionLoading(true);

      const created = await createAirlineApi({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        country: country.trim(),
        is_active: isActive,
      });

      // Añadir la nueva aerolínea al inicio de la lista local
      setItems((prev) => [created, ...prev]);

      // Limpiar el formulario
      setName("");
      setCode("");
      setCountry("");
      setIsActive(true);
    } catch {
      setErrorMessage("Error al registrar la aerolínea en MongoDB.");
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Elimina un documento de aerolínea por su ObjectId.
   */
  const handleDeleteAirline = async (id: string, airlineName: string): Promise<void> => {
    try {
      setErrorMessage("");
      await deleteAirlineApi(id);
      // Filtrar el elemento eliminado de la lista local
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch {
      setErrorMessage(`No se pudo eliminar la aerolínea ${airlineName}.`);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListHeaderComponent={
          <View style={styles.formContainer}>
            <Text style={styles.title}>Aerolíneas (MongoDB)</Text>
            <Text style={styles.subtitle}>Gestión NoSQL - Colección: airlines</Text>

            {/* Mensaje de error */}
            {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

            {/* Input Nombre */}
            <Text style={styles.label}>Nombre de la Aerolínea</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ej: American Airlines"
              placeholderTextColor="#8b949e"
              style={styles.input}
            />

            {/* Input Código */}
            <Text style={styles.label}>Código IATA (ej: AA, IB, LA)</Text>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="AA"
              placeholderTextColor="#8b949e"
              style={styles.input}
              autoCapitalize="characters"
              maxLength={6}
            />

            {/* Input País */}
            <Text style={styles.label}>País de Origen</Text>
            <TextInput
              value={country}
              onChangeText={setCountry}
              placeholder="Ej: Estados Unidos / España"
              placeholderTextColor="#8b949e"
              style={styles.input}
            />

            {/* Switch Nativo: Aerolínea Activa */}
            <View style={styles.switchRow}>
              <Text style={styles.label}>Aerolínea Activa (Switch)</Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                thumbColor={isActive ? "#58a6ff" : "#8b949e"}
                trackColor={{ false: "#30363d", true: "#1f6feb" }}
              />
            </View>

            {/* Botón Crear */}
            <Pressable
              onPress={handleCreateAirline}
              style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#58a6ff" />
              ) : (
                <Text style={styles.btnText}>Crear Aerolínea en Mongo</Text>
              )}
            </Pressable>

            {/* Botón Refrescar */}
            <Pressable
              onPress={loadAirlines}
              style={({ pressed }) => [
                styles.btn,
                styles.btnOutline,
                pressed && styles.btnPressed,
              ]}
            >
              <Text style={[styles.btnText, styles.btnOutlineText]}>
                Refrescar Lista
              </Text>
            </Pressable>

            {loading && <ActivityIndicator color="#58a6ff" style={{ marginVertical: 12 }} />}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>
                {item.name} ({item.code})
              </Text>
              <Text style={styles.rowSub}>
                País: {item.country} | {item.is_active ? "🟢 Activa" : "🔴 Inactiva"}
              </Text>
              {!!item.created_at && (
                <Text style={styles.rowDate}>
                  Registrado: {new Date(item.created_at).toLocaleDateString()}
                </Text>
              )}
            </View>

            {/* Botón Eliminar */}
            <Pressable
              onPress={() => handleDeleteAirline(item.id, item.name)}
              style={styles.delBtn}
            >
              <Text style={styles.delText}>Eliminar</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No hay aerolíneas registradas en MongoDB.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
    padding: 16,
  },
  list: {
    flex: 1,
  },
  formContainer: {
    marginBottom: 16,
  },
  title: {
    color: "#58a6ff",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },
  subtitle: {
    color: "#8b949e",
    fontSize: 13,
    marginBottom: 12,
  },
  error: {
    color: "#ff7b72",
    backgroundColor: "rgba(255, 123, 114, 0.1)",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 123, 114, 0.3)",
  },
  label: {
    color: "#8b949e",
    marginBottom: 4,
    marginTop: 6,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#161b22",
    color: "#c9d1d9",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#30363d",
    marginBottom: 6,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
    paddingHorizontal: 2,
  },
  btn: {
    backgroundColor: "#21262d",
    borderColor: "#58a6ff",
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  btnOutline: {
    borderColor: "#30363d",
    backgroundColor: "transparent",
    marginBottom: 8,
  },
  btnPressed: {
    backgroundColor: "#30363d",
  },
  btnText: {
    color: "#58a6ff",
    textAlign: "center",
    fontWeight: "700",
  },
  btnOutlineText: {
    color: "#8b949e",
  },
  row: {
    backgroundColor: "#161b22",
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#30363d",
  },
  rowInfo: {
    flex: 1,
    marginRight: 10,
  },
  rowTitle: {
    color: "#c9d1d9",
    fontWeight: "800",
    fontSize: 16,
  },
  rowSub: {
    color: "#8b949e",
    marginTop: 3,
    fontSize: 13,
  },
  rowDate: {
    color: "#6e7681",
    marginTop: 3,
    fontSize: 11,
  },
  delBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "rgba(255, 123, 114, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 123, 114, 0.3)",
  },
  delText: {
    color: "#ff7b72",
    fontWeight: "700",
    fontSize: 12,
  },
  emptyText: {
    color: "#8b949e",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
});
