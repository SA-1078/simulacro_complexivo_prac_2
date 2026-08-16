/**
 * ============================================================================
 * PANTALLA: CRUD DE EVENTOS OPERATIVOS (MONGODB - COLECCIÓN FLIGHT_EVENTS)
 * ============================================================================
 * Cumple con todos los requerimientos avanzados del examen:
 * 1. SELECT 1 (Picker): Selección de vuelo proveniente de PostgreSQL (GET /api/flights/)
 *    mostrando el número de vuelo, destino y estado.
 * 2. SELECT 2 (Picker): Selección del tipo de evento (CREATED | BOARDING_STARTED | DEPARTED | DELAYED | CANCELLED).
 * 3. COMPONENTES NATIVOS ADICIONALES:
 *    - RadioGroup: Selección del origen (MOBILE | WEB | SYSTEM).
 *    - Switch: Notificación inmediata a torre de control.
 *    - CheckboxRow: Confirmación del registro y vinculación SQL-NoSQL.
 * 4. Input opcional de notas.
 * 5. Fecha: NO se envía desde la app al crear (el backend asigna created_at actual en MongoDB).
 * 6. Listado y eliminación de eventos operativos.
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
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import { listFlightsApi } from "../api/flights.api";
import {
  listFlightEventsApi,
  createFlightEventApi,
  deleteFlightEventApi,
} from "../api/flightEvents.api";

import RadioGroup from "../components/RadioGroup";
import CheckboxRow from "../components/CheckboxRow";

import type { Flight } from "../types/flight";
import type { FlightEvent, EventType, EventSource } from "../types/flightEvent";
import { toArray } from "../types/drf";

export default function FlightEventsScreen() {
  // Lista de eventos de MongoDB y lista de vuelos de PostgreSQL
  const [events, setEvents] = useState<FlightEvent[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);

  // ESTADO SELECT 1: ID del vuelo de PostgreSQL
  const [selectedFlightId, setSelectedFlightId] = useState<number | null>(null);

  // ESTADO SELECT 2: Tipo de Evento
  const [selectedEventType, setSelectedEventType] = useState<EventType>("CREATED");

  // ESTADO RADIO GROUP: Origen del evento
  const [source, setSource] = useState<EventSource>("MOBILE");

  // ESTADO SWITCH: Notificación inmediata
  const [notifyTower, setNotifyTower] = useState<boolean>(true);

  // ESTADO CHECKBOX: Confirmación de registro
  const [confirmed, setConfirmed] = useState<boolean>(true);

  // ESTADO INPUT: Notas descriptivas
  const [note, setNote] = useState("");

  // Estados de carga y mensajes
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /**
   * Carga en paralelo los eventos desde MongoDB y los vuelos desde PostgreSQL.
   */
  const loadData = async (): Promise<void> => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [eventsRes, flightsRes] = await Promise.all([
        listFlightEventsApi(),
        listFlightsApi(),
      ]);

      const flightsList = toArray(flightsRes);
      setEvents(eventsRes || []);
      setFlights(flightsList);

      // Preseleccionar el primer vuelo de la lista si aún no hay uno seleccionado
      if (selectedFlightId === null && flightsList.length > 0) {
        setSelectedFlightId(flightsList[0].id);
      }
    } catch {
      setErrorMessage("Error al cargar datos. Verifique que Backend, Postgres y MongoDB estén activos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Envía la creación del evento a MongoDB vinculando el flight_id de PostgreSQL.
   */
  const handleCreateEvent = async (): Promise<void> => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      if (selectedFlightId === null) {
        setErrorMessage("Debe seleccionar un vuelo de la lista.");
        return;
      }

      if (!confirmed) {
        setErrorMessage("Debe marcar la casilla de confirmación para registrar.");
        return;
      }

      setActionLoading(true);

      // Nota: created_at NO se envía; el backend coloca datetime.now(timezone.utc)
      const created = await createFlightEventApi({
        flight_id: selectedFlightId,
        event_type: selectedEventType,
        source: source,
        note: note.trim() ? note.trim() : undefined,
      });

      // Insertar el nuevo evento al inicio de la lista
      setEvents((prev) => [created, ...prev]);
      setNote("");
      setSuccessMessage("Evento operativo registrado en MongoDB con éxito.");
    } catch {
      setErrorMessage("No se pudo registrar el evento. Verifique la existencia del vuelo en PostgreSQL.");
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Elimina un evento operativo de MongoDB.
   */
  const handleDeleteEvent = async (id: string): Promise<void> => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      await deleteFlightEventApi(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setSuccessMessage("Evento eliminado de MongoDB.");
    } catch {
      setErrorMessage("No se pudo eliminar el evento.");
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListHeaderComponent={
          <View style={styles.formCard}>
            <Text style={styles.title}>Eventos Operativos (MongoDB)</Text>
            <Text style={styles.subtitle}>
              Registro NoSQL vinculado con vuelos de PostgreSQL
            </Text>

            {/* Mensajes de feedback */}
            {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
            {!!successMessage && <Text style={styles.success}>{successMessage}</Text>}

            {/* ============================================================== */}
            {/* SELECT 1: Vuelo (PostgreSQL) */}
            {/* ============================================================== */}
            <Text style={styles.label}>
              1. Vuelo (PostgreSQL - Número, Destino y Estado)
            </Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedFlightId ?? ""}
                onValueChange={(val) => setSelectedFlightId(Number(val))}
                dropdownIconColor="#58a6ff"
                style={styles.picker}
              >
                {flights.length === 0 ? (
                  <Picker.Item label="No hay vuelos en PostgreSQL" value="" />
                ) : (
                  flights.map((f) => (
                    <Picker.Item
                      key={f.id}
                      label={`ID #${f.id} - ${f.flight_number} -> ${f.destination} (${f.status})`}
                      value={f.id}
                    />
                  ))
                )}
              </Picker>
            </View>

            {/* ============================================================== */}
            {/* SELECT 2: Tipo de Evento */}
            {/* ============================================================== */}
            <Text style={styles.label}>2. Tipo de Evento (Picker NoSQL)</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedEventType}
                onValueChange={(val) => setSelectedEventType(val as EventType)}
                dropdownIconColor="#58a6ff"
                style={styles.picker}
              >
                <Picker.Item label="CREATED (Vuelo Creado/Programado)" value="CREATED" />
                <Picker.Item label="BOARDING_STARTED (Embarque Iniciado)" value="BOARDING_STARTED" />
                <Picker.Item label="DEPARTED (Vuelo Despegado)" value="DEPARTED" />
                <Picker.Item label="DELAYED (Vuelo Demorado)" value="DELAYED" />
                <Picker.Item label="CANCELLED (Vuelo Cancelado)" value="CANCELLED" />
              </Picker>
            </View>

            {/* ============================================================== */}
            {/* COMPONENTE NATIVO: RadioGroup (Origen del evento) */}
            {/* ============================================================== */}
            <RadioGroup<EventSource>
              label="3. Origen del Evento (RadioGroup)"
              value={source}
              onChange={setSource}
              options={[
                { label: "MÓVIL (MOBILE)", value: "MOBILE" },
                { label: "WEB (WEB)", value: "WEB" },
                { label: "SISTEMA (SYSTEM)", value: "SYSTEM" },
              ]}
            />

            {/* ============================================================== */}
            {/* COMPONENTE NATIVO: Switch (Notificación a torre de control) */}
            {/* ============================================================== */}
            <View style={styles.switchRow}>
              <Text style={styles.label}>Notificar a torre de control (Switch)</Text>
              <Switch
                value={notifyTower}
                onValueChange={setNotifyTower}
                thumbColor={notifyTower ? "#58a6ff" : "#8b949e"}
                trackColor={{ false: "#30363d", true: "#1f6feb" }}
              />
            </View>

            {/* Campo Notas */}
            <Text style={styles.label}>Notas u Observaciones (opcional)</Text>
            <TextInput
              placeholder="Ej: Pasajeros abordando puerta 01 sin demoras"
              placeholderTextColor="#8b949e"
              value={note}
              onChangeText={setNote}
              style={styles.input}
            />

            {/* ============================================================== */}
            {/* COMPONENTE NATIVO: CheckboxRow (Confirmación) */}
            {/* ============================================================== */}
            <CheckboxRow
              label="Confirmar registro del evento y vinculación SQL-NoSQL"
              checked={confirmed}
              onChange={setConfirmed}
            />

            {/* Botón Registrar */}
            <Pressable
              onPress={handleCreateEvent}
              style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#58a6ff" />
              ) : (
                <Text style={styles.btnText}>Registrar Evento en Mongo (sin fecha manual)</Text>
              )}
            </Pressable>

            {/* Botón Refrescar */}
            <Pressable
              onPress={loadData}
              style={({ pressed }) => [
                styles.btn,
                styles.btnOutline,
                pressed && styles.btnPressed,
              ]}
            >
              <Text style={[styles.btnText, styles.btnOutlineText]}>
                Refrescar Datos
              </Text>
            </Pressable>

            {loading && <ActivityIndicator color="#58a6ff" style={{ marginVertical: 12 }} />}
          </View>
        }
        renderItem={({ item }) => {
          const matchedFlight = flights.find((f) => f.id === item.flight_id);
          return (
            <View style={styles.row}>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>
                  Vuelo #{item.flight_id}
                  {matchedFlight ? ` (${matchedFlight.flight_number})` : ""} — {item.event_type}
                </Text>
                <Text style={styles.rowSub}>Origen: {item.source}</Text>
                {!!item.note && <Text style={styles.rowSub}>Nota: {item.note}</Text>}
                {!!item.created_at && (
                  <Text style={styles.rowDate}>
                    Fecha: {new Date(item.created_at).toLocaleString()}
                  </Text>
                )}
              </View>

              {/* Botón Eliminar */}
              <Pressable
                onPress={() => handleDeleteEvent(item.id)}
                style={styles.delBtn}
              >
                <Text style={styles.delText}>Eliminar</Text>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No hay eventos registrados en MongoDB.</Text>
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
  formCard: {
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
  success: {
    color: "#3fb950",
    backgroundColor: "rgba(63, 185, 80, 0.1)",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(63, 185, 80, 0.3)",
  },
  label: {
    color: "#8b949e",
    marginBottom: 6,
    marginTop: 8,
    fontWeight: "600",
  },
  pickerWrapper: {
    backgroundColor: "#161b22",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#30363d",
    marginBottom: 8,
    overflow: "hidden",
  },
  picker: {
    color: "#c9d1d9",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
    paddingHorizontal: 2,
  },
  input: {
    backgroundColor: "#161b22",
    color: "#c9d1d9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  btn: {
    backgroundColor: "#21262d",
    borderColor: "#58a6ff",
    borderWidth: 1,
    padding: 13,
    borderRadius: 8,
    marginTop: 6,
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
    fontSize: 15,
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
    fontSize: 15,
  },
  rowSub: {
    color: "#8b949e",
    marginTop: 2,
    fontSize: 13,
  },
  rowDate: {
    color: "#6e7681",
    marginTop: 2,
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
