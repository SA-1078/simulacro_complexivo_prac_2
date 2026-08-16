/**
 * ============================================================================
 * CLIENTE HTTP CON AXIOS E INTERCEPTOR JWT
 * ============================================================================
 * Centraliza las peticiones a la API REST de Django.
 * Inyecta automáticamente el token de autenticación Bearer en la cabecera Authorization
 * recuperándolo del almacenamiento global en memoria (globalThis).
 */

import axios from "axios";
import { API_BASE_URL } from "../config";

// Definición del almacén global en memoria para guardar el token durante la sesión
type GlobalAuthStore = {
  accessToken?: string;
  refreshToken?: string;
};

// Instancia configurada de Axios
export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de peticiones salientes para inyectar el Bearer Token JWT
http.interceptors.request.use((config) => {
  const store = globalThis as unknown as GlobalAuthStore;
  const token = store.accessToken;

  config.headers = config.headers ?? {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
