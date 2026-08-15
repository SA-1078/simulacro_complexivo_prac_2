import { useEffect, useState } from "react";
import {
  Container, Paper, Typography, TextField, Button, Stack,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Alert
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { type Gates, listGatesApi, createGateApi, updateGateApi, deleteGateApi } from "../api/gates.api";

export default function AdminGatessPage() {
  const [items, setItems] = useState<Gates[]>([]);
  const [code, setCode] = useState("");
  const [terminal, setTerminal] = useState("");
  //const [is_available, setIsAvailable] = useState();
  const [created_at, setCreatedAt] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const data = await listGatesApi();
      setItems(data.results); // DRF paginado
    } catch {
      setError("No se pudo cargar marcas. ¿Login? ¿Token admin?");
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      setError("");
      if (!code.trim()) return setError("Codigo requerido");

      if (editId) await updateGateApi(editId, code.trim());
      else await createGateApi(code.trim());

      setCode("");
      setTerminal("");
      //setIsAvailable("");
      setCreatedAt("");
      setEditId(null);
      await load();
    } catch {
      setError("No se pudo guardar el gate. ¿Token admin?");
    }
  };

  const startEdit = (m: Gates) => {
    setEditId(m.id);
    setCode(m.code);
    setTerminal(m.terminal);
    //setIsAvailable(m.is_available);
    setCreatedAt(m.created_at);
    setCreatedAt("");
  };

  const remove = async (id: number) => {
    try {
      setError("");
      await deleteGateApi(id);
      await load();
    } catch {
      setError("No se pudo eliminar el gate. ¿Vuelos asociados? ¿Token admin?");
    }
  };

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Admin Gates (Privado)</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
          <TextField label="Codigo Gate" value={code} onChange={(e) => setCode(e.target.value)} fullWidth />
          <Button variant="contained" onClick={save}>{editId ? "Actualizar" : "Crear"}</Button>
          <Button variant="outlined" onClick={() => { setCode(""); setEditId(null); }}>Limpiar</Button>
          <Button variant="outlined" onClick={load}>Refrescar</Button>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Codigo</TableCell>
              <TableCell>terminal</TableCell>
              <TableCell>is_available</TableCell>
              <TableCell>created_at</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.id}</TableCell>
                <TableCell>{m.code}</TableCell>
                <TableCell>{m.terminal}</TableCell>
                <TableCell>{m.is_available}</TableCell>
                <TableCell>{m.created_at}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => startEdit(m)}><EditIcon /></IconButton>
                  <IconButton onClick={() => remove(m.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}