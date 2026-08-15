from django.db import models


class Estados(models.TextChoices):
        SCHEDULED = "scheduled", "Scheduled"
        BOARDING = "boarding", "Boarding"
        DEPARTED = "en_embarque", "En embarque"
        DELAYED = "retrasado", "Retrasado" 
        CANCELLED = "cancelado", "Cancelado"


class Gates(models.Model):
    code = models.CharField(max_length=120, unique=True)
    terminal = models.CharField(max_length=20, null=False)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code

class Flights(models.Model):
    gate_id = models.ForeignKey(Gates, on_delete=models.PROTECT, related_name="vehiculos")
    flight_number = models.CharField(max_length=20, null=False)
    destination = models.CharField(max_length=20, unique=True)
    status = models.CharField(
        max_length=20,
        choices=Estados.choices,
        default=Estados.SCHEDULED
    )
    departure_time = models.TimeField(null=True, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.Gates.gate_id} {self.flight_number} ({self.status})"