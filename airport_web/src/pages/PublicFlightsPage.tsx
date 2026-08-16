/**
 * ============================================================================
 * PÁGINA: LISTADO PÚBLICO DE VUELOS Y PUERTAS (PUBLIC FLIGHTS PAGE)
 * ============================================================================
 * Cumple con los requerimientos de Frontend del examen:
 * 1. Consume en paralelo los endpoints GET /api/flights/ y GET /api/gates/ (PostgreSQL)
 * 2. Muestra los vuelos con sus estados formateados visualmente con Chips de color
 * 3. Muestra las puertas de embarque disponibles y ocupadas
 * 4. Gestiona estados de carga (CircularProgress) y errores de conexión (Alert)
 */

import { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  Chip,
  Box,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";

import { type Flight, listFlightsPublicApi } from "../api/flights.api";
import { type Gates, listGatesApi } from "../api/gates.api";

export default function PublicFlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [gates, setGates] = useState<Gates[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  /**
   * Consume en paralelo los endpoints GET /flights y GET /gates
   */
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [flightsRes, gatesRes] = await Promise.all([
        listFlightsPublicApi(),
        listGatesApi(),
      ]);
      setFlights(flightsRes.results || []);
      setGates(gatesRes.results || []);
    } catch {
      setError("No se pudo cargar la información del aeropuerto. Verifique que el backend esté en ejecución.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Asigna estilos y colores a los Chips según el estado operativo del vuelo
   */
  const renderStatus = (st: string) => {
    switch (st) {
      case "SCHEDULED": return <Chip label="PROGRAMADO" color="primary" size="small" />;
      case "BOARDING":  return <Chip label="EMBARCANDO" color="warning" size="small" />;
      case "DEPARTED":  return <Chip label="DESPEGADO" color="success" size="small" />;
      case "DELAYED":   return <Chip label="RETRASADO" color="secondary" size="small" />;
      case "CANCELLED": return <Chip label="CANCELADO" color="error" size="small" />;
      default:          return <Chip label={st} size="small" />;
    }
  };

  /**
   * Obtiene la descripción legible de la puerta de embarque según su ID relacional
   */
  const getGateText = (id: number) => {
    const g = gates.find((item) => item.id === id);
    return g ? `${g.code} (${g.terminal})` : `Puerta #${id}`;
  };

  return (
    <Container sx={{ mt: 3, mb: 4 }}>
      {/* Barra de título y botón de recarga */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Panel Público del Aeropuerto</Typography>
        <Button variant="contained" startIcon={<RefreshIcon />} onClick={loadData} disabled={loading}>
          Refrescar
        </Button>
      </Stack>

      {/* Manejo de Error */}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Manejo de Carga */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={50} />
        </Box>
      ) : (
        <Stack spacing={4}>
          {/* TABLA DE VUELOS (POSTGRESQL) */}
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <FlightTakeoffIcon color="primary" />
              <Typography variant="h6">Vuelos Programados y Operativos</Typography>
            </Stack>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>N° Vuelo</strong></TableCell>
                  <TableCell><strong>Destino</strong></TableCell>
                  <TableCell><strong>Puerta</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Salida</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {flights.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No hay vuelos registrados en PostgreSQL.</TableCell>
                  </TableRow>
                ) : (
                  flights.map((f) => (
                    <TableRow key={f.id} hover>
                      <TableCell>{f.id}</TableCell>
                      <TableCell><strong>{f.flight_number}</strong></TableCell>
                      <TableCell>{f.destination}</TableCell>
                      <TableCell>{getGateText(f.gate_id)}</TableCell>
                      <TableCell>{renderStatus(f.status)}</TableCell>
                      <TableCell>{new Date(f.departure_time).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>

          {/* TABLA DE PUERTAS (POSTGRESQL) */}
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <MeetingRoomIcon color="primary" />
              <Typography variant="h6">Puertas de Embarque (Gates)</Typography>
            </Stack>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Código</strong></TableCell>
                  <TableCell><strong>Terminal</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Creado</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No hay puertas registradas.</TableCell>
                  </TableRow>
                ) : (
                  gates.map((g) => (
                    <TableRow key={g.id} hover>
                      <TableCell>{g.id}</TableCell>
                      <TableCell><strong>{g.code}</strong></TableCell>
                      <TableCell>{g.terminal}</TableCell>
                      <TableCell>
                        <Chip
                          label={g.is_available ? "DISPONIBLE" : "OCUPADA"}
                          color={g.is_available ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{new Date(g.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Stack>
      )}
    </Container>
  );
}
