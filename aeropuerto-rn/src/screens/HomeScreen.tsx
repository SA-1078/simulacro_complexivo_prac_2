/**
 * ============================================================================
 * PANTALLA: MENÚ PRINCIPAL (HOME SCREEN)
 * ============================================================================
 * Proporciona acceso a los módulos NoSQL (MongoDB):
 * 1. CRUD de Aerolíneas (airlines)
 * 2. CRUD de Eventos Operativos (flight_events) con 2 Selects y componentes nativos
 * 3. Opción de cerrar sesión (Logout local)
 */

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../types/navigation";

type NavProp = NativeStackNavigationProp<RootStackParamList, "Home">;

type GlobalAuthStore = {
  accessToken?: string;
  refreshToken?: string;
};

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();

  /**
   * Cierra la sesión eliminando el token en memoria y redirigiendo al Login.
   */
  const handleLogout = (): void => {
    const store = globalThis as unknown as GlobalAuthStore;
    store.accessToken = undefined;
    store.refreshToken = undefined;
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <Text style={styles.title}>Panel Operativo</Text>
      <Text style={styles.subtitle}>
        Gestión NoSQL (MongoDB) integrada con PostgreSQL
      </Text>

      {/* Botón hacia CRUD de Aerolíneas */}
      <Pressable
        onPress={() => navigation.navigate("Airlines")}
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
      >
        <Text style={styles.btnTitle}>1. Aerolíneas (Airlines - MongoDB)</Text>
        <Text style={styles.btnDesc}>
          Listar, registrar y eliminar aerolíneas registradas en NoSQL
        </Text>
      </Pressable>

      {/* Botón hacia CRUD de Eventos Operativos */}
      <Pressable
        onPress={() => navigation.navigate("FlightEvents")}
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
      >
        <Text style={styles.btnTitle}>2. Eventos de Vuelos (Flight Events)</Text>
        <Text style={styles.btnDesc}>
          2 Selects (Vuelo SQL + Tipo de Evento) + RadioGroup + Switch + Checkbox
        </Text>
      </Pressable>

      {/* Botón de Logout */}
      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.btn,
          styles.btnDanger,
          pressed && styles.btnDangerPressed,
        ]}
      >
        <Text style={[styles.btnTitle, styles.btnDangerText]}>
          Cerrar Sesión (Logout)
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
    padding: 20,
  },
  title: {
    color: "#58a6ff",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 10,
    marginBottom: 4,
  },
  subtitle: {
    color: "#8b949e",
    fontSize: 14,
    marginBottom: 24,
  },
  btn: {
    backgroundColor: "#161b22",
    borderColor: "#30363d",
    borderWidth: 1,
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  btnPressed: {
    backgroundColor: "#21262d",
    borderColor: "#58a6ff",
  },
  btnTitle: {
    color: "#58a6ff",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  btnDesc: {
    color: "#8b949e",
    fontSize: 13,
  },
  btnDanger: {
    borderColor: "#ff7b72",
    backgroundColor: "rgba(255, 123, 114, 0.05)",
    marginTop: 12,
  },
  btnDangerPressed: {
    backgroundColor: "rgba(255, 123, 114, 0.15)",
  },
  btnDangerText: {
    color: "#ff7b72",
    textAlign: "center",
    marginBottom: 0,
  },
});
