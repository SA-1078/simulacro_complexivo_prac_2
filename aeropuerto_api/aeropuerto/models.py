from django.db import models


# Enum para controlar estrictamente los estados permitidos de un vuelo
class Estados(models.TextChoices):
    SCHEDULED = "SCHEDULED", "SCHEDULED"    # Vuelo programado
    BOARDING = "BOARDING", "BOARDING"        # Pasajeros embarcando
    DEPARTED = "DEPARTED", "DEPARTED"        # Vuelo despegado
    DELAYED = "DELAYED", "DELAYED"          # Vuelo demorado
    CANCELLED = "CANCELLED", "CANCELLED"    # Vuelo cancelado


# ============================================================================
# TABLA: gates (Puertas de embarque en PostgreSQL)
# ============================================================================
class Gates(models.Model):
    # code: Código único de la puerta (ej: 'G01', 'G02')
    code = models.CharField(max_length=10, unique=True)
    # terminal: Nombre de la terminal (ej: 'T1', 'T2')
    terminal = models.CharField(max_length=20, default="T1")
    # is_available: Booleano indicando si la puerta está libre o asignada
    is_available = models.BooleanField(default=True)
    # created_at: Fecha y hora de creación automática
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Gate"
        verbose_name_plural = "Gates"

    def __str__(self):
        return f"{self.code} ({self.terminal})"


# ============================================================================
# TABLA: flights (Vuelos en PostgreSQL)
# ============================================================================
class Flights(models.Model):
    # Relación Foránea N:1 hacia Gates.
    # on_delete=models.PROTECT evita eliminar una puerta si tiene vuelos asignados.
    gate_id = models.ForeignKey(
        Gates,
        on_delete=models.PROTECT,
        related_name="flights",
        db_column="gate_id"
    )
    # flight_number: Código comercial del vuelo (ej: 'AA1234', 'IB6400')
    flight_number = models.CharField(max_length=20)
    # destination: Ciudad o aeropuerto de destino (ej: 'Miami (MIA)')
    destination = models.CharField(max_length=100)
    # status: Estado del vuelo limitado a los valores de la clase Estados
    status = models.CharField(
        max_length=20,
        choices=Estados.choices,
        default=Estados.SCHEDULED
    )
    # departure_time: Fecha y hora programada para el despegue
    departure_time = models.DateTimeField()
    # created_at: Timestamp de inserción en la base de datos
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Flight"
        verbose_name_plural = "Flights"

    def __str__(self):
        return f"{self.flight_number} -> {self.destination} ({self.status})"