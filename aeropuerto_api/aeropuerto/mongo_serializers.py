from rest_framework import serializers

class TiposEventos:
        CREATED = "creado"
        BOARDING_STARTED = "embarcando"
        DEPARTED = "embarcado"
        DELAYED = "retrasado"
        CANCELLED = "cancelado"

        CHOICES = [
            (CREATED, "creado"),
            (BOARDING_STARTED,"embarcando"),
            (DEPARTED, "embarcado"),
            (DELAYED, "retrasado"),
            (CANCELLED, "cancelado"),
        ]


class Sources:
        WEB = "web"
        MOBILE = "movil"
        SYSTEM = "sistema"

        CHOICES = [
            (WEB, "web"),
            (MOBILE, "movil"),
            (SYSTEM, "sistema"),
        ]




class AirlinesSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    code = serializers.CharField(max_length=120)
    country = serializers.CharField(max_length=120)
    is_active = serializers.BooleanField(default=True)
    created_at = serializers.DateTimeField(required=False)

class Flight_EventsSerializer(serializers.Serializer):
    flight_id = serializers.IntegerField()        # ID de Vehiculo (Postgres)
    event_type = serializers.ChoiceField(
        choices=TiposEventos.CHOICES,
        default=TiposEventos.CREATED
    )
    source = serializers.ChoiceField(
        choices=Sources.CHOICES,
        default=Sources.WEB
    )
    note = serializers.CharField(max_length=120)
    created_at = serializers.DateTimeField(required=False)
