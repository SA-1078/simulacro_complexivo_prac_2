/**
 * ============================================================================
 * COMPONENTE: RUTA PROTEGIDA (REQUIRE AUTH) - REACT ROUTER
 * ============================================================================
 * Intercepta la navegación hacia rutas privadas (/admin, /admin/gates, /admin/flights).
 * Si no existe un accessToken en localStorage, redirige inmediatamente a /login.
 */

import { Navigate } from "react-router-dom";
import type { JSX } from "react";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("accessToken");

  // Si no hay token de sesión, enviar al usuario al formulario de login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderizar la vista solicitada
  return children;
}