import { useEffect, useState } from "react";
import { Container, Paper, Typography, Button, Stack, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { type Flight, listFlightsPublicApi } from "../api/flights.api";

export default function PublicFlightsPage() {
  const [items, setItems] = useState<Flight[]>([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const data = await listFlightsPublicApi();
      setItems(data.results); // DRF paginado
    } catch {
      setError("No se pudo cargar la lista pública. ¿Backend encendido?");
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row"  sx={{ mb: 2 }}>
          <Typography variant="h5">Lista de Vuelos (Público)</Typography>
          <Button variant="outlined" onClick={load}>Refrescar</Button>
        </Stack>

        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>gate_id</TableCell>
              <TableCell>flight_number</TableCell>
              <TableCell>destination</TableCell>
              <TableCell>status</TableCell>
              <TableCell>departure_time</TableCell>
              <TableCell>created_at</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((v) => (
              <TableRow key={v.id}>
                <TableCell>{v.id}</TableCell>
                <TableCell>{v.gate_id ?? v.gate_id}</TableCell>
                <TableCell>{v.flight_number}</TableCell>
                <TableCell>{v.destination}</TableCell>
                <TableCell>{v.status}</TableCell>
                <TableCell>{v.departure_time || "-"}</TableCell>
                <TableCell>{v.created_at}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}