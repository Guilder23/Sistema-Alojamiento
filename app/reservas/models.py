from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from app.habitaciones.models import Habitacion
from app.clientes.models import Cliente


class Reserva(models.Model):
    """Modelo para gestionar las reservas del alojamiento"""
    
    ESTADOS_RESERVA = [
        ('pendiente', 'Pendiente'),
        ('confirmada', 'Confirmada'),
        ('cancelada', 'Cancelada'),
        ('finalizada', 'Finalizada'),
        ('no_show', 'No presentado'),
    ]
    
    habitacion = models.ForeignKey(
        Habitacion,
        on_delete=models.PROTECT,
        related_name='reservas',
        help_text="Habitación reservada"
    )
    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.CASCADE,
        related_name='reservas',
        help_text="Cliente que realiza la reserva"
    )
    
    fecha_entrada = models.DateField(
        help_text="Fecha de check-in"
    )
    fecha_salida = models.DateField(
        help_text="Fecha de check-out"
    )
    
    num_huespedes = models.PositiveIntegerField(
        default=1,
        help_text="Número de huéspedes"
    )
    
    estado = models.CharField(
        max_length=20,
        choices=ESTADOS_RESERVA,
        default='pendiente'
    )
    
    precio_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Total a pagar (calculado automáticamente)"
    )
    
    notas = models.TextField(
        blank=True,
        null=True,
        help_text="Notas especiales de la reserva"
    )
    
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-fecha_entrada']
        verbose_name = 'Reserva'
        verbose_name_plural = 'Reservas'
    
    def __str__(self):
        return f"Reserva {self.id} - {self.cliente.nombre} ({self.fecha_entrada})"
    
    def clean(self):
        """Validar que no exista otra reserva conflictiva"""
        if self.fecha_entrada >= self.fecha_salida:
            raise ValidationError("La fecha de entrada debe ser anterior a la fecha de salida")
        
        if self.num_huespedes > self.habitacion.capacidad:
            raise ValidationError(
                f"El número de huéspedes ({self.num_huespedes}) excede la capacidad "
                f"de la habitación ({self.habitacion.capacidad})"
            )
        
        # Verificar conflicto de fechas
        reservas_conflictivas = Reserva.objects.filter(
            habitacion=self.habitacion,
            estado__in=['confirmada', 'pendiente']
        ).exclude(id=self.id)
        
        for reserva in reservas_conflictivas:
            if not (self.fecha_salida <= reserva.fecha_entrada or 
                    self.fecha_entrada >= reserva.fecha_salida):
                raise ValidationError(
                    f"Conflicto de fechas con reserva existente "
                    f"({reserva.fecha_entrada} a {reserva.fecha_salida})"
                )
    
    def save(self, *args, **kwargs):
        self.clean()
        if not self.precio_total:
            self.calcular_precio_total()
        super().save(*args, **kwargs)
    
    def calcular_precio_total(self):
        """Calcular el precio total de la reserva"""
        noches = (self.fecha_salida - self.fecha_entrada).days
        self.precio_total = noches * self.habitacion.precio_noche
        return self.precio_total
    
    @property
    def noches(self):
        return (self.fecha_salida - self.fecha_entrada).days
    
    @property
    def esta_activa(self):
        return self.estado in ['pendiente', 'confirmada']


class HistorialReserva(models.Model):
    """Registro de cambios en las reservas"""
    
    reserva = models.ForeignKey(
        Reserva,
        on_delete=models.CASCADE,
        related_name='historial'
    )
    cambio = models.CharField(max_length=255)
    estado_anterior = models.CharField(max_length=20, blank=True, null=True)
    estado_nuevo = models.CharField(max_length=20, blank=True, null=True)
    creado = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-creado']
    
    def __str__(self):
        return f"Cambio en Reserva {self.reserva.id} - {self.cambio}"
