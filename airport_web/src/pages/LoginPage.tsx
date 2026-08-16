import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Paper, Typography, TextField, Button, Stack, Alert } from "@mui/material";
import { loginApi } from "../api/auth.api";
import { getErrorMessage } from "../api/http";

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("colimbas");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const doLogin = async () => {
    try {
      if (!username.trim() || !password) {
        return setMsg({ type: "error", text: "Por favor ingrese el usuario y la contraseña." });
      }
      const data = await loginApi(username.trim(), password);
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("username", username.trim());
      setMsg({ type: "success", text: `Login exitoso como "${username}". Redirigiendo al panel admin...` });
      setTimeout(() => {
        navigate("/admin");
      }, 700);
    } catch (err: unknown) {
      setMsg({ type: "error", text: getErrorMessage(err, "Error de autenticación. Verifique sus credenciales.") });
    }
  };

  const clear = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    setMsg({ type: "info", text: "Sesión cerrada y tokens eliminados localmente." });
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, maxWidth: 480, mx: "auto" }}>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: "bold" }}>
          Iniciar Sesión (JWT)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Ingrese con un usuario administrador (superuser o is_staff) para crear, editar o eliminar registros.
        </Typography>

        <Stack spacing={2.5}>
          {msg && <Alert severity={msg.type}>{msg.text}</Alert>}

          <TextField
            label="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            onKeyDown={(e) => {
              if (e.key === "Enter") doLogin();
            }}
          />

          <Button variant="contained" size="large" onClick={doLogin}>
            Ingresar
          </Button>
          <Button variant="outlined" color="inherit" onClick={clear}>
            Cerrar sesión (Eliminar tokens)
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}