/**
 * ============================================================================
 * PÁGINA ACERCA DE (ABOUT PAGE) - REACT WEB
 * ============================================================================
 * Detalla la arquitectura técnica y los endpoints consumidos por la aplicación.
 */

import { Container, Paper, Typography, List, ListItem, ListItemText } from "@mui/material";

export default function AboutPage() {
  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Acerca de la Solución Técnica</Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          Endpoints consumidos desde el Backend Django REST Framework:
        </Typography>

        <List dense>
          <ListItem>
            <ListItemText
              primary="GET /api/gates/"
              secondary="Consulta pública de puertas de embarque (PostgreSQL)."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="GET /api/flights/"
              secondary="Consulta pública de vuelos y sus estados (PostgreSQL)."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="POST /api/auth/login/"
              secondary="Generación de tokens de acceso JWT (Simple JWT)."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="CRUD /api/gates/ & CRUD /api/flights/"
              secondary="Gestión protegida para usuarios con rol administrador (is_staff=True)."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="CRUD /api/airlines/ & /api/flight_events/"
              secondary="Endpoints NoSQL (MongoDB) consumidos por la app móvil."
            />
          </ListItem>
        </List>

        <Typography variant="body2" color="text.secondary">
          Configuración: Base URL configurable mediante la variable de entorno <code>VITE_API_BASE_URL</code>.
        </Typography>
      </Paper>
    </Container>
  );
}