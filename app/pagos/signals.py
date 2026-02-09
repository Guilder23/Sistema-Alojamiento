"""
Signals para el módulo de pagos
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from app.reservas.models import Reserva
from .models import Pago


@receiver(post_save, sender=Reserva)
def crear_pago_reserva(sender, instance, created, **kwargs):
    """
    Crear automáticamente un pago cuando se crea una reserva
    o cuando cambia a estado confirmada
    """
    # Si es una nueva reserva o cambió a confirmada, verificar si tiene pago
    if created or instance.estado == 'confirmada':
        # Verificar si ya existe un pago para esta reserva
        pago_existente = Pago.objects.filter(reserva=instance).first()
        
        if not pago_existente:
            # Crear el pago automáticamente
            Pago.objects.create(
                reserva=instance,
                monto=instance.precio_total,
                tipo_pago='transferencia',  # Por defecto será transferencia/QR
                estado='pendiente',
                estado_validacion='pendiente'
            )
