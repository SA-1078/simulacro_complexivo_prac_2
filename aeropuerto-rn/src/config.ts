/**
 * ============================================================================
 * ARCHIVO DE CONFIGURACIÓN - BASE URL DE LA API
 * ============================================================================
 * Define la dirección IP y puerto del backend Django REST Framework.
 * 
 * NOTA DE CONEXIÓN POR CABLE USB:
 * Si tu teléfono está conectado por cable USB con depuración activada, ejecuta en tu terminal:
 *   adb reverse tcp:8000 tcp:8000
 * Y utiliza "http://localhost:8000" aquí abajo.
 * 
 * NOTA DE RED WI-FI (Dispositivo Físico):
 * Si están en la misma red Wi-Fi, pon la IP local de tu PC (ej: "http://192.168.1.50:8000").
 * 
 * NOTA EMULADOR ANDROID:
 * Si usas el emulador de Android Studio: "http://10.0.2.2:8000".
 */
export const API_BASE_URL = "http://localhost:8000";
