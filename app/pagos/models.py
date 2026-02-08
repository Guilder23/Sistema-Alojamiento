from django.db import models
from django.core.validators import MinValueValidator
from app.reservas.models import Reserva


class Pago(models.Model):
    """Modelo para registrar los pagos de las reservas"""
    
    TIPOS_PAGO = [
        ('efectivo', 'Efectivo'),
        ('transferencia', 'Transferencia'),
        ('tarjeta', 'Tarjeta de Crédito/Débito'),
    ]
    
    ESTADOS_PAGO = [
        ('pendiente', 'Pendiente'),
        ('pagado', 'Pagado'),
        ('parcial', 'Pago Parcial'),
        ('reembolsado', 'Reembolsado'),
    ]
    
    reserva = models.ForeignKey(
        Reserva,
        on_delete=models.CASCADE,
        related_name='pagos',
        help_text="Reserva asociada al pago"
    )
    
    monto = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Monto del pago"
    )
    
    tipo_pago = models.CharField(
        max_length=20,
        choices=TIPOS_PAGO,
        default='efectivo',
        help_text="Método de pago utilizado"
    )
    
    estado = models.CharField(
        max_length=20,
        choices=ESTADOS_PAGO,
        default='pendiente'
    )
    
    fecha_pago = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha y hora del pago"
    )
    
    comprobante = models.FileField(
        upload_to='pagos/comprobantes/%Y/%m/',
        blank=True,
        null=True,
        help_text="Comprobante de pago (factura, recibo, etc)"
    )
    
    referencia = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Referencia de transferencia o número de autorización"
    )
    
    notas = models.TextField(
        blank=True,
        null=True,
        help_text="Notas adicionales del pago"
    )
    
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-fecha_pago']
        verbose_name = 'Pago'
        verbose_name_plural = 'Pagos'
    
    def __str__(self):
        return f"Pago {self.id} - Reserva {self.reserva.id} (${self.monto})"
    
    @property
    def monto_faltante(self):
        """Calcular monto pendiente por pagar"""
        total_pagado = self.reserva.pagos.filter(
            estado__in=['pagado', 'parcial']
        ).aggregate(total=models.Sum('monto'))['total'] or 0
        return max(0, self.reserva.precio_total - total_pagado)


class MetodoPago(models.Model):
    """Métodos de pago disponibles en el hotel"""
    
    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=20, choices=Pago.TIPOS_PAGO)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = 'Método de Pago'
        verbose_name_plural = 'Métodos de Pago'
    
    def __str__(self):
        return f"{self.nombre} ({self.get_tipo_display()})"
