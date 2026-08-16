/**
 * ============================================================================
 * PÁGINA: ADMINISTRACIÓN DE PUERTAS DE EMBARQUE (ADMIN GATES PAGE) - PRIVADO
 * ============================================================================
 * Permite realizar operaciones CRUD sobre la tabla PostgreSQL 'gates':
 * - Listar puertas de embarque (GET /api/gates/)
 * - Crear nueva puerta de embarque (POST /api/gates/)
 * - Editar puerta de embarque existente (PATCH /api/gates/:id/)
 * - Eliminar puerta de embarque (DELETE /api/gates/:id/)
 * - Feedback detallado de errores y permisos devueltos por el backend
 */

import { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Alert,
  FormControlLabel,
  Checkbox,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { type Gates, listGatesApi, createGateApi, updateGateApi, deleteGateApi } from "../api/gates.api";
import { getErrorMessage } from "../api/http";

export default function AdminGatesPage() {
  // Estados de datos
  const [items, setItems] = useState<Gates[]>([]);
  const [code, setCode] = useState("");
  const [terminal, setTerminal] = useState("T1");
  const [isAvailable, setIsAvailable] = useState(true);

  // Estado de edición (si editId no es nulo, el formulario edita; si es nulo, crea)
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /**
   * Resetea el formulario al estado inicial de creación.
   */
  const reset = () => {
    setEditId(null);
    setCode("");
    setTerminal("T1");
    setIsAvailable(true);
  };

  /**
   * Carga la lista de puertas desde el backend Django.
   */
  const load = async () => {
    try {
      setError("");
      const data = await listGatesApi();
      setItems(data.results || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cargar puertas. ¿Login? ¿Token admin?"));
    }
  };

  useEffect(() => {
    load();
  }, []);

  /**
   * Guarda o actualiza la puerta de embarque en PostgreSQL.
   */
  const save = async () => {
    try {
      setError("");
      setSuccess("");

      if (!code.trim()) return setError("El código de la puerta es obligatorio (ej. G01)");
      if (!terminal.trim()) return setError("La terminal es obligatoria (ej. T1)");

      const payload = {
        code: code.trim().toUpperCase(),
        terminal: terminal.trim().toUpperCase(),
        is_available: isAvailable,
      };

      if (editId) {
        // Operación PATCH para actualización
        await updateGateApi(editId, payload);
        setSuccess("Puerta actualizada correctamente en PostgreSQL.");
      } else {
        // Operación POST para creación
        await createGateApi(payload);
        setSuccess("Puerta creada correctamente en PostgreSQL.");
      }
      reset();
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Error al guardar la puerta. Verifique permisos o código duplicado."));
    }
  };

  /**
   * Carga los datos de la fila seleccionada en el formulario para editar.
   */
  const startEdit = (g: Gates) => {
    setEditId(g.id);
    setCode(g.code);
    setTerminal(g.terminal);
    setIsAvailable(g.is_available);
    setError("");
    setSuccess("");
  };

  /**
   * Elimina una puerta de embarque por su ID.
   */
  const remove = async (id: number) => {
    try {
      setError("");
      setSuccess("");
      await deleteGateApi(id);
      await load();
      setSuccess("Puerta eliminada correctamente.");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo eliminar puerta. ¿Tiene vuelos asociados o falta token admin?"));
    }
  };

  return (
    <Container sx={{ mt: 3, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Admin Puertas de Embarque (Gates)
        </Typography>

        {/* Mensajes de feedback */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* Formulario de creación / edición */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <TextField
            label="Código (ej. G01)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            fullWidth
          />
          <TextField
            label="Terminal"
            value={terminal}
            onChange={(e) => setTerminal(e.target.value)}
            fullWidth
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
              />
            }
            label="Disponible"
            sx={{ minWidth: 140 }}
          />
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

        {/* Tabla de registros */}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Código</strong></TableCell>
              <TableCell><strong>Terminal</strong></TableCell>
              <TableCell><strong>Disponible</strong></TableCell>
              <TableCell><strong>Creado en</strong></TableCell>
              <TableCell align="right"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay puertas registradas.
                </TableCell>
              </TableRow>
            ) : (
              items.map((g) => (
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
                  <TableCell>{g.created_at ? new Date(g.created_at).toLocaleDateString() : "-"}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => startEdit(g)} title="Editar">
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => remove(g.id)} title="Eliminar">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}