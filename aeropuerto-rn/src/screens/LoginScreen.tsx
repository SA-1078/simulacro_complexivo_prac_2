/**
 * ============================================================================
 * PANTALLA: LOGIN (AUTENTICACIÓN JWT CONTRA BACKEND DRF)
 * ============================================================================
 * Permite iniciar sesión con usuario y contraseña. Al autenticar con éxito:
 * 1. Envía POST a /api/auth/login/
 * 2. Guarda el accessToken en memoria global para el interceptor de Axios
 * 3. Redirige al menú principal (HomeScreen)
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { loginApi } from "../api/auth.api";
import type { RootStackParamList } from "../types/navigation";

// Tipo tipado para la navegación desde la pantalla de Login
type NavProp = NativeStackNavigationProp<RootStackParamList, "Login">;

// Tipo del almacén global en memoria
type GlobalAuthStore = {
  accessToken?: string;
  refreshToken?: string;
};

export default function LoginScreen() {
  const navigation = useNavigation<NavProp>();

  // Estados locales del formulario (prellenados con el superusuario creado)
  const [username, setUsername] = useState("colimbas");
  const [password, setPassword] = useState("admin123");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Ejecuta la autenticación contra el backend Django.
   */
  const doLogin = async (): Promise<void> => {
    try {
      setErrorMessage("");

      if (!username.trim() || !password) {
        setErrorMessage("Por favor ingrese usuario y contraseña.");
        return;
      }

      setLoading(true);

      // Petición HTTP al endpoint JWT
      const tokenPair = await loginApi(username.trim(), password);

      // Guardar token en memoria global para que http.interceptors lo agregue a cada request
      const store = globalThis as unknown as GlobalAuthStore;
      store.accessToken = tokenPair.access;
      store.refreshToken = tokenPair.refresh;

      // Navegar a Home reemplazando la vista de Login en el historial
      navigation.replace("Home");
    } catch (err: unknown) {
      setErrorMessage("Login falló. Verifique credenciales, backend encendido y Base URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.card}>
        {/* Título y subtítulo */}
        <Text style={styles.title}>Aeropuerto Móvil</Text>
        <Text style={styles.subtitle}>Control de Operaciones & NoSQL</Text>

        {/* Mensaje de error en caso de fallo */}
        {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

        {/* Campo Usuario */}
        <Text style={styles.label}>Usuario</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="admin / colimbas"
          placeholderTextColor="#8b949e"
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Campo Contraseña */}
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#8b949e"
          style={styles.input}
          secureTextEntry
        />

        {/* Botón de Ingreso */}
        <Pressable
          onPress={doLogin}
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#58a6ff" />
          ) : (
            <Text style={styles.btnText}>Ingresar</Text>
          )}
        </Pressable>

        {/* Nota informativa de arquitectura */}
        <Text style={styles.note}>
          JWT Bearer token almacenado en memoria global para el consumo seguro de APIs.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#161b22",
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  title: {
    color: "#58a6ff",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: "#8b949e",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
  },
  error: {
    color: "#ff7b72",
    backgroundColor: "rgba(255, 123, 114, 0.1)",
    padding: 10,
    borderRadius: 6,
    marginBottom: 14,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 123, 114, 0.3)",
  },
  label: {
    color: "#8b949e",
    marginBottom: 6,
    marginTop: 8,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#0d1117",
    color: "#c9d1d9",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#30363d",
    fontSize: 15,
  },
  btn: {
    marginTop: 18,
    backgroundColor: "#21262d",
    borderColor: "#58a6ff",
    borderWidth: 1,
    padding: 14,
    borderRadius: 8,
  },
  btnPressed: {
    backgroundColor: "#30363d",
  },
  btnText: {
    color: "#58a6ff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  note: {
    color: "#8b949e",
    marginTop: 16,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
});
