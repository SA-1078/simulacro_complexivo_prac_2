from rest_framework import serializers

class TiposEventos:
    # Se reemplazan los estados de los vuelos con respecto al modelo en ingles
    # Se usa la convencion para que el API pueda identificar que tipo de evento se esta generando
    CREATED = "CREATED"
    BOARDING_STARTED = "BOARDING_STARTED"
    DEPARTED = "DEPARTED"
    DELAYED = "DELAYED"
    CANCELLED = "CANCELLED"

    CHOICES = [
        (CREATED, "CREATED"),
        (BOARDING_STARTED, "BOARDING_STARTED"),
        (DEPARTED, "DEPARTED"),
        (DELAYED, "DELAYED"),
        (CANCELLED, "CANCELLED"),
    ]

# Se definen las fuentes de los eventos, para saber desde donde se esta generando el evento
# Se usan los nombres estandarizados para los eventos mencionados en documentacion
class Sources:
    WEB = "WEB"
    MOBILE = "MOBILE"
    SYSTEM = "SYSTEM"

    CHOICES = [
        (WEB, "WEB"),
        (MOBILE, "MOBILE"),
        (SYSTEM, "SYSTEM"),
    ]


class AirlinesSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    # Se repara el problema de que el campo sea obligatorio para que pueda ser opcional, ya que no es necesario
    # que se le ponga codigo a todas las aerolineas
    ## Se define required=False para que el campo sea opcional
    code = serializers.CharField(max_length=10)
    country = serializers.CharField(max_length=100)
    is_active = serializers.BooleanField(default=True)
    created_at = serializers.DateTimeField(required=False)

# Se repara el campo id para que acepte enteros y no solo strings, esto se debe a que en postgres 
# el id es un entero autogenerado, mientras que en mongo es un string
class Flight_EventsSerializer(serializers.Serializer):
    flight_id = serializers.IntegerField()
    event_type = serializers.ChoiceField(
        choices=TiposEventos.CHOICES,
        default=TiposEventos.CREATED
    )
    source = serializers.ChoiceField(
        choices=Sources.CHOICES,
        default=Sources.WEB
    )
    # Se repara el campo note para que sea opcional y no sea obligatorio
    note = serializers.CharField(required=False, allow_blank=True, default="")
    created_at = serializers.DateTimeField(required=False)

