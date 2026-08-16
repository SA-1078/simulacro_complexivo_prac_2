/**
 * ============================================================================
 * ARCHIVO PRINCIPAL DE LA APLICACIÓN (App.tsx)
 * ============================================================================
 * Configura la navegación raíz de la aplicación usando React Navigation (Native Stack).
 * Define las rutas:
 * 1. Login: Autenticación JWT inicial
 * 2. Home: Menú principal de operaciones
 * 3. Airlines: Gestión NoSQL de aerolíneas en MongoDB
 * 4. FlightEvents: Gestión NoSQL de eventos con 2 Selects y componentes nativos
 */

import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Pantallas del flujo de navegación
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import AirlinesScreen from "./src/screens/AirlinesScreen";
import FlightEventsScreen from "./src/screens/FlightEventsScreen";

// Tipado de rutas y parámetros
import type { RootStackParamList } from "./src/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      {/* Barra de estado con estilo claro para contraste con fondo oscuro */}
      <StatusBar style="light" />

      {/* Navegador en pila principal */}
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          // Estilo de encabezado con paleta oscura premium
          headerStyle: {
            backgroundColor: "#161b22",
          },
          headerTintColor: "#58a6ff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          contentStyle: {
            backgroundColor: "#0d1117",
          },
        }}
      >
        {/* Pantalla 1: Login JWT */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: "Inicio de Sesión",
            headerShown: false, // Ocultar header en el login
          }}
        />

        {/* Pantalla 2: Menú Principal */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "Menú Principal",
            headerBackVisible: false, // Evitar volver a Login con back button
          }}
        />

        {/* Pantalla 3: Aerolíneas (MongoDB) */}
        <Stack.Screen
          name="Airlines"
          component={AirlinesScreen}
          options={{
            title: "Aerolíneas (MongoDB)",
          }}
        />

        {/* Pantalla 4: Eventos Operativos (MongoDB + Selects) */}
        <Stack.Screen
          name="FlightEvents"
          component={FlightEventsScreen}
          options={{
            title: "Eventos de Vuelo",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
