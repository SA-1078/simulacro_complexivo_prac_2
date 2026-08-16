import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const http = axios.create({
  baseURL: API_BASE_URL,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getErrorMessage(err: unknown, defaultMsg: string): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 401) {
      return "No autorizado (401). Token no válido o expirado. Inicie sesión en /login con su usuario administrador.";
    }
    if (err.response?.status === 403) {
      return "Acceso denegado (403). El usuario no tiene permisos de administrador (is_staff=True).";
    }
    if (err.response?.data) {
      if (typeof err.response.data === "string") return err.response.data;
      if (err.response.data.detail) return String(err.response.data.detail);
      if (typeof err.response.data === "object") {
        return Object.entries(err.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ");
      }
    }
  }
  if (err instanceof Error) return err.message;
  return defaultMsg;
}