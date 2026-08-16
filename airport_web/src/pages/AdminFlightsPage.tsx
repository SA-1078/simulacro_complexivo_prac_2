/**
 * ============================================================================
 * PÁGINA: ADMINISTRACIÓN DE VUELOS (ADMIN FLIGHTS PAGE) - PRIVADO
 * ============================================================================
 * Permite gestionar las operaciones CRUD sobre la tabla PostgreSQL 'flights':
 * - Listar vuelos (GET /api/flights/) con sus puertas asociadas
 * - Crear vuelo (POST /api/flights/) y generar automáticamente evento en MongoDB
 * - Editar vuelo (PATCH /api/flights/:id/)
 * - Eliminar vuelo (DELETE /api/flights/:id/)
 * - Manejo de selector de fecha y hora local para datetime-local
 */

import { useEffect, useState } from "react";
import {
  Container, Paper, Typography, TextField, Button, Stack,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Alert,
  FormControl, InputLabel, Select, MenuItem, Chip
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { type Gates, listGatesApi } from "../api/gates.api";
import { type Flight, type FlightStatus, listFlightsAdminApi, createFlightApi, updateFlightApi, deleteFlightApi } from "../api/flights.api";
import { getErrorMessage } from "../api/http";

export default function AdminFlightsPage() {
  // Estados de listas
  const [flights, setFlights] = useState<Flight[]>([]);
  const [gates, setGates] = useState<Gates[]>([]);
  
  // Estado de edición (si editId tiene un número, se está editando ese registro)
  const [editId, setEditId] = useState<number | null>(null);

  // Estados del formulario
  const [gateId, setGateId] = useState<number | "">("");
  const [flightnumber, setFlightNumber] = useState("");
  const [destination, setDestination] = useState("");
  const [status, setStatus] = useState<FlightStatus>("SCHEDULED");
  const [departuretime, setDepartureTime] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /**
   * Carga los vuelos y las puertas en paralelo desde el backend.
   */
  const load = async () => {
    try {
      setError("");
      const [flightsRes, gatesRes] = await Promise.all([
        listFlightsAdminApi(),
        listGatesApi(),
      ]);
      setFlights(flightsRes.results || []);
      setGates(gatesRes.results || []);
      if (gatesRes.results?.length > 0 && gateId === "") {
        setGateId(gatesRes.results[0].id);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudieron cargar los datos. ¿Token admin activo?"));
    }
  };

  useEffect(() => {
    load();
  }, []);

  /**
   * Resetea el formulario al modo creación.
   */
  const reset = () => {
    setEditId(null);
    setFlightNumber("");
    setDestination("");
    setStatus("SCHEDULED");
    setDepartureTime("");
  };

  /**
   * Guarda o actualiza un vuelo en PostgreSQL.
   */
  const save = async () => {
    try {
      setError("");
      setSuccess("");

      if (!gateId) return setError("Seleccione una puerta de embarque.");
      if (!flightnumber.trim()) return setError("El número de vuelo es obligatorio.");
      if (!destination.trim()) return setError("El destino es obligatorio.");
      if (!departuretime) return setError("La fecha y hora de salida es obligatoria.");

      const dateObj = new Date(departuretime);
      if (isNaN(dateObj.getTime())) {
        return setError("Fecha de salida inválida.");
      }

      const payload = {
        gate_id: Number(gateId),
        flight_number: flightnumber.trim().toUpperCase(),
        destination: destination.trim(),
        status,
        departure_time: dateObj.toISOString(),
      };

      if (editId) {
        // Operación PATCH para actualización
        await updateFlightApi(editId, payload);
        setSuccess("Vuelo actualizado correctamente en PostgreSQL.");
      } else {
        // Operación POST para creación (dispara también evento en MongoDB)
        await createFlightApi(payload);
        setSuccess("Vuelo creado en PostgreSQL y registrado en MongoDB.");
      }
      reset();
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo guardar el vuelo. Verifique los campos."));
    }
  };

  /**
   * Carga los datos de un vuelo en el formulario para editar.
   */
  const startEdit = (v: Flight) => {
    setEditId(v.id);
    setGateId(v.gate_id);
    setFlightNumber(v.flight_number);
    setDestination(v.destination);
    setStatus(v.status);
    if (v.departure_time) {
      const dt = new Date(v.departure_time);
      const pad = (n: number) => n.toString().padStart(2, "0");
      const formatted = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
      setDepartureTime(formatted);
    }
    setError("");
    setSuccess("");
  };

  /**
   * Elimina un vuelo por su ID.
   */
  const remove = async (id: number) => {
    try {
      setError("");
      setSuccess("");
      await deleteFlightApi(id);
      setSuccess("Vuelo eliminado correctamente.");
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo eliminar el vuelo. ¿Token admin?"));
    }
  };

  return (
    <Container sx={{ mt: 3, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Admin Vuelos (PostgreSQL)</Typography>

        {/* Mensajes de feedback */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* Formulario */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            {/* Selector de Puerta */}
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel id="gate-label">Puerta (Gate)</InputLabel>
              <Select
                labelId="gate-label"
                label="Puerta (Gate)"
                value={gateId}
                onChange={(e) => setGateId(Number(e.target.value))}
              >
                {gates.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.code} (Terminal {g.terminal})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Número de Vuelo */}
            <TextField
              label="Número de Vuelo (ej. AA1234)"
              value={flightnumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              fullWidth
            />
            {/* Destino */}
            <TextField
              label="Destino"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              sx={{ minWidth: 200 }}
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
            {/* Estado del Vuelo */}
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="status-label">Estado</InputLabel>
              <Select
                labelId="status-label"
                label="Estado"
                value={status}
                onChange={(e) => setStatus(e.target.value as FlightStatus)}
              >
                <MenuItem value="SCHEDULED">SCHEDULED (Programado)</MenuItem>
                <MenuItem value="BOARDING">BOARDING (Embarcando)</MenuItem>
                <MenuItem value="DEPARTED">DEPARTED (Despegado)</MenuItem>
                <MenuItem value="DELAYED">DELAYED (Demorado)</MenuItem>
                <MenuItem value="CANCELLED">CANCELLED (Cancelado)</MenuItem>
              </Select>
            </FormControl>

            {/* Fecha y Hora de Salida */}
            <TextField
              label="Fecha y Hora de Salida"
              type="datetime-local"
              slotProps={{ inputLabel: { shrink: true } }}
              value={departuretime}
              onChange={(e) => setDepartureTime(e.target.value)}
              sx={{ minWidth: 240 }}
            />

            {/* Botones de acción */}
            <Button variant="contained" onClick={save} sx={{ minWidth: 120 }}>
              {editId ? "Actualizar" : "Crear"}
            </Button>
            <Button variant="outlined" onClick={() => { reset(); setError(""); setSuccess(""); }} sx={{ minWidth: 100 }}>
              Limpiar
            </Button>
            <Button variant="outlined" onClick={load} sx={{ minWidth: 100 }}>
              Refrescar
            </Button>
          </Stack>
        </Stack>

        {/* Tabla de Vuelos */}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Puerta</strong></TableCell>
              <TableCell><strong>Nº Vuelo</strong></TableCell>
              <TableCell><strong>Destino</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell><strong>Fecha de Salida</strong></TableCell>
              <TableCell align="right"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {flights.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay vuelos registrados.
                </TableCell>
              </TableRow>
            ) : (
              flights.map((v) => {
                const gateObj = gates.find((g) => g.id === v.gate_id);
                return (
                  <TableRow key={v.id} hover>
                    <TableCell>{v.id}</TableCell>
                    <TableCell>{gateObj ? `${gateObj.code} (${gateObj.terminal})` : `ID ${v.gate_id}`}</TableCell>
                    <TableCell><strong>{v.flight_number}</strong></TableCell>
                    <TableCell>{v.destination}</TableCell>
                    <TableCell>
                      <Chip
                        label={v.status}
                        size="small"
                        color={v.status === "SCHEDULED" ? "primary" : v.status === "DEPARTED" ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell>{v.departure_time ? new Date(v.departure_time).toLocaleString() : "-"}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => startEdit(v)} title="Editar">
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => remove(v.id)} title="Eliminar">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}