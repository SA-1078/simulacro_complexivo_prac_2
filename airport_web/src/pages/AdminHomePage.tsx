/**
 * ============================================================================
 * PÁGINA: PANEL ADMINISTRATIVO (ADMIN HOME PAGE) - PRIVADO
 * ============================================================================
 * Acceso protegido por el componente RequireAuth para usuarios con token JWT.
 * Ofrece accesos directos a:
 * 1. CRUD de Puertas de Embarque (/admin/gates)
 * 2. CRUD de Vuelos (/admin/flights)
 */

import { Container, Paper, Typography, Stack, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function AdminHomePage() {
  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Panel de Control Administrativo</Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Seleccione el módulo relacional de PostgreSQL que desea administrar:
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button variant="contained" component={Link} to="/admin/gates">
            CRUD Puertas de Embarque (Gates)
          </Button>
          <Button variant="contained" component={Link} to="/admin/flights">
            CRUD Vuelos (Flights)
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}