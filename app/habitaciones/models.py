from django.db import models
from django.core.validators import MinValueValidator

class Habitacion(models.Model):
    """Modelo para gestionar las habitaciones del alojamiento"""
    
    TIPOS_HABITACION = [
        ('simple', 'Habitación Simple'),
        ('doble', 'Habitación Doble'),
        ('suite', 'Suite'),
        ('deluxe', 'Deluxe'),
        ('presidencial', 'Suite Presidencial'),
    ]
    
    ESTADOS_HABITACION = [
        ('disponible', 'Disponible'),
        ('ocupada', 'Ocupada'),
        ('limpieza', 'En limpieza'),
        ('fuera_servicio', 'Fuera de servicio'),
    ]
    
    numero = models.CharField(
        max_length=10,
        unique=True,
        help_text="Número único de la habitación"
    )
    tipo = models.CharField(
        max_length=20,
        choices=TIPOS_HABITACION,
        default='doble'
    )
    capacidad = models.PositiveIntegerField(
        default=2,
        validators=[MinValueValidator(1)],
        help_text="Número máximo de personas"
    )
    precio_noche = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Precio por noche en $"
    )
    estado = models.CharField(
        max_length=20,
        choices=ESTADOS_HABITACION,
        default='disponible'
    )
    descripcion = models.TextField(
        blank=True,
        null=True,
        help_text="Descripción detallada de la habitación"
    )
    foto = models.ImageField(
        upload_to='habitaciones/%Y/%m/',
        blank=True,
        null=True,
        help_text="Foto principal de la habitación"
    )
    piso = models.PositiveIntegerField(
        default=1,
        help_text="Número del piso"
    )
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['numero']
        verbose_name = 'Habitación'
        verbose_name_plural = 'Habitaciones'
    
    def __str__(self):
        return f"Habitación {self.numero} - {self.get_tipo_display()}"


class AmenidadHabitacion(models.Model):
    """Amenidades disponibles en las habitaciones"""
    
    habitacion = models.ForeignKey(
        Habitacion,
        on_delete=models.CASCADE,
        related_name='amenidades'
    )
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = 'Amenidad'
        verbose_name_plural = 'Amenidades'
    
    def __str__(self):
        return f"{self.nombre} - {self.habitacion.numero}"


class FotoHabitacion(models.Model):
    """Galería de fotos para cada habitación"""
    
    habitacion = models.ForeignKey(
        Habitacion,
        on_delete=models.CASCADE,
        related_name='fotos'
    )
    foto = models.ImageField(upload_to='habitaciones/galeria/%Y/%m/')
    descripcion = models.CharField(max_length=200, blank=True, null=True)
    creado = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-creado']
        verbose_name = 'Foto'
        verbose_name_plural = 'Fotos'
    
    def __str__(self):
        return f"Foto - {self.habitacion.numero}"
