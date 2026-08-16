/**
 * ============================================================================
 * ARCHIVO PRINCIPAL DE ENRUTAMIENTO (App.tsx) - REACT WEB
 * ============================================================================
 * Configura la barra de navegación superior (AppBar de Material UI) y las rutas:
 * 1. Públicas: / (Home), /acerca (Acerca de), /lista (Lista pública), /login (Login JWT)
 * 2. Privadas (RequireAuth): /admin, /admin/gates, /admin/flights
 */

import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Stack } from "@mui/material";

// Páginas de la aplicación
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import PublicFlightsPage from "./pages/PublicFlightsPage";
import LoginPage from "./pages/LoginPage";

import AdminHomePage from "./pages/AdminHomePage";
import AdminGatesPage from "./pages/AdminGatesPage";
import AdminFlightsPage from "./pages/AdminFlightsPage";

// Protección de rutas
import RequireAuth from "./components/RequireAuth";

export default function App() {
  return (
    <BrowserRouter>
      {/* Barra de Navegación Superior */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            Aeropuerto UI (MUI)
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ flexWrap: "wrap" }}>
            <Button color="inherit" component={Link} to="/">Home</Button>
            <Button color="inherit" component={Link} to="/acerca">Acerca</Button>
            <Button color="inherit" component={Link} to="/lista">Lista</Button>
            <Button color="inherit" component={Link} to="/login">Login</Button>
            <Button color="inherit" component={Link} to="/admin">Admin</Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Definición de Rutas */}
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/acerca" element={<AboutPage />} />
        <Route path="/lista" element={<PublicFlightsPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas Privadas (Protegidas por RequireAuth) */}
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminHomePage />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/gates"
          element={
            <RequireAuth>
              <AdminGatesPage />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/flights"
          element={
            <RequireAuth>
              <AdminFlightsPage />
            </RequireAuth>
          }
        />

        {/* Ruta por defecto (Redireccionar a Home) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}