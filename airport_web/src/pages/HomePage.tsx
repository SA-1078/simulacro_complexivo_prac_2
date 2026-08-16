/**
 * ============================================================================
 * PÁGINA PRINCIPAL (HOME PAGE) - REACT WEB
 * ============================================================================
 * Pantalla de bienvenida que explica el flujo del sistema web:
 * - Lista Pública de Vuelos (/lista)
 * - Login con JWT (/login)
 * - Panel de Administración Privado (/admin) para Puertas y Vuelos
 */

import { Container, Paper, Typography, Stack } from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";

export default function HomePage() {
  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <FlightTakeoffIcon color="primary" />
          <Typography variant="h5">Sistema de Control Aeroportuario (MUI)</Typography>
        </Stack>

        <Typography variant="body1" sx={{ mb: 2 }}>
          SPA desarrollada en React + TypeScript + Material UI (MUI) + React Router.
          Consume la API de Django REST Framework (PostgreSQL & MongoDB).
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Flujo de navegación:
          <br />
          1. <strong>Lista Pública:</strong> Consulta en tiempo real de vuelos y puertas de embarque.
          <br />
          2. <strong>Login:</strong> Autenticación mediante tokens JWT.
          <br />
          3. <strong>Panel Admin:</strong> Gestión CRUD completa de Puertas de Embarque y Vuelos.
        </Typography>
      </Paper>
    </Container>
  );
}