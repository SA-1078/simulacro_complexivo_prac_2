import { useEffect, useState } from "react";
import {
  Container, Paper, Typography, TextField, Button, Stack,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Alert,
  FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { type Gates, listGatesApi } from "../api/gates.api";
import { type Flight, listFlightsAdminApi, createFlightApi, updateFlightApi, deleteFlightApi } from "../api/flights.api";

export default function AdminFlightsPage() {
  const [items, setItems] = useState<Flight[]>([]);
  const [code, setCode] = useState<Gates[]>([]);
  const [error, setError] = useState("");

  const [editId, setEditId] = useState<number | null>(null);

  const [gate_id, setGateid] = useState<number>(0);
  const [flight_number, setFlight_number] = useState("");
  const [destination, setDestination] = useState("");
  const [status, setStatus] = useState("");
  const [departure_time, setDeparture_time] = useState("");
  const [created_at, setCreated_at] = useState("");

  const load = async () => {
    try {
      setError("");
      const data = await listFlightsAdminApi();
      setItems(data.results); // DRF paginado
    } catch {
      setError("No se pudo cargar vehículos. ¿Login? ¿Token admin?");
    }
  };

  const loadGates = async () => {
    try {
      const data = await listGatesApi();
      setCode(data.results); // DRF paginado
      if (!code && data.results.length > 0) setCode(data.results[0].id);
    } catch {
      // si falla, no bloquea la pantalla
    }
  };

  useEffect(() => { load(); loadGates(); }, []);

  const save = async () => {
    try {
      setError("");
      if (!code) return setError("Seleccione una gate");
      if (!flight_number.trim() || !flight_number.trim()) return setError("Gate y numero de vuelo son requeridos");

      const payload = {
        gate_id: Number(gate_id),
        flight_number: flight_number.trim(),
        destination: destination.trim(),
        status: status.trim(),
        departure_time: departure_time.trim(),
        created_at: created_at.trim(),
      };

      if (editId) await updateFlightApi(editId, payload);
      else await createFlightApi(payload as any);

      setEditId(null);
      setGateid(0);
      setFlight_number("");
      setDestination("");
      setStatus("");
      setDeparture_time("");
      setCreated_at("");
      await load();
    } catch {
      setError("No se pudo guardar el vuelo. ¿Token admin?");
    }
  };

  const startEdit = (v: Flight) => {
    setEditId(v.id);
    setGateid(v.gate_id);
    setFlight_number(v.flight_number);
    setDestination(v.destination);
    setStatus(v.status);
    setDeparture_time(v.departure_time);
    setCreated_at(v.created_at);
  };

  const remove = async (id: number) => {
    try {
      setError("");
      await deleteFlightApi(id);
      await load();
    } catch {
      setError("No se pudo eliminar vehículo. ¿Token admin?");
    }
  };

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Admin Vuelos (Privado)</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack spacing={2} sx={{ mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>

            <FormControl sx={{ width: 260 }}>
              <InputLabel id="marca-label">Marca</InputLabel>
              <Select
                labelId="marca-label"
                label="Marca"
                value={code}
                onChange={(e) => setCode(Number(e.target.value))}
              >
                {flights.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.nombre} (#{m.id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField label="COdigo" value={code} onChange={(e) => setGateid(e.target.value)} fullWidth />
            <TextField label="Año" type="number" value={anio} onChange={(e) => setAnio(Number(e.target.value))} sx={{ width: 160 }} />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField label="Placa" value={placa} onChange={(e) => setPlaca(e.target.value)} sx={{ width: 220 }} />
            <TextField label="Color" value={color} onChange={(e) => setColor(e.target.value)} sx={{ width: 220 }} />

            <Button variant="contained" onClick={save}>{editId ? "Actualizar" : "Crear"}</Button>
            <Button variant="outlined" onClick={() => { setEditId(null); setModelo(""); setPlaca(""); setColor(""); }}>Limpiar</Button>
            <Button variant="outlined" onClick={() => { load(); loadMarcas(); }}>Refrescar</Button>
          </Stack>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Marca</TableCell>
              <TableCell>Modelo</TableCell>
              <TableCell>Año</TableCell>
              <TableCell>Placa</TableCell>
              <TableCell>Color</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((v) => (
              <TableRow key={v.id}>
                <TableCell>{v.id}</TableCell>
                <TableCell>{v.marca_nombre ?? v.marca}</TableCell>
                <TableCell>{v.modelo}</TableCell>
                <TableCell>{v.anio}</TableCell>
                <TableCell>{v.placa}</TableCell>
                <TableCell>{v.color || "-"}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => startEdit(v)}><EditIcon /></IconButton>
                  <IconButton onClick={() => remove(v.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}