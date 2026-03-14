from django.db import models
from django.core.validators import MinValueValidator

class Habitacion(models.Model):
    """Modelo para gestionar las habitaciones del alojamiento"""
    
    TIPOS_HABITACION = [
        ('simple', 'Habitación Simple'),
        ('doble', 'Habitación Doble'),
        ('triple', 'Habitación Triple'),
        ('suite', 'Suite'),
        ('deluxe', 'Deluxe'),
        ('presidencial', 'Suite Presidencial'),
    ]
    
    ESTADOS_HABITACION = [
        ('disponible', 'Disponible'),
        ('ocupada', 'Ocupada'),
        ('limpieza', 'En limpieza'),
        ('mantenimiento', 'Mantenimiento'),
        ('fuera_servicio', 'Fuera de servicio'),
    ]

    TIPOS_BANO = [
        ('privado', 'Baño privado'),
        ('compartido', 'Baño compartido'),
        ('sin_bano', 'Sin baño'),
    ]

    TIPOS_CAMA = [
        ('single', 'Single'),
        ('queen', 'Queen'),
        ('king', 'King'),
        ('mixta', 'Mixta'),
    ]

    VISTAS = [
        ('mar', 'Mar'),
        ('ciudad', 'Ciudad'),
        ('jardin', 'Jardín'),
        ('montana', 'Montaña'),
        ('interior', 'Interior'),
        ('sin_vista', 'Sin vista'),
    ]
    
    numero = models.CharField(
        max_length=10,
        unique=True,
        help_text="Número único de la habitación"
    )

    nombre = models.CharField(
        max_length=100,
        default='',
        help_text='Nombre comercial de la habitación (ej: Habitación Doble Deluxe)'
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

    # Campos extra (amenidades/servicios)
    tipo_bano = models.CharField(
        max_length=20,
        choices=TIPOS_BANO,
        default='privado'
    )
    tv = models.BooleanField(default=True)
    internet = models.BooleanField(default=True)
    acceso_youtube = models.BooleanField(default=False)
    aire_acondicionado = models.BooleanField(default=False)
    calefaccion = models.BooleanField(default=False)
    minibar = models.BooleanField(default=False)
    caja_fuerte = models.BooleanField(default=False)
    escritorio = models.BooleanField(default=False)
    armario = models.BooleanField(default=True)
    agua_caliente = models.BooleanField(default=True)
    toallas = models.BooleanField(default=True)
    papel_higienico = models.BooleanField(default=True)
    shampoo = models.BooleanField(default=False)
    secador_cabello = models.BooleanField(default=False)

    bano_privado = models.BooleanField(default=True)
    vista = models.CharField(max_length=20, choices=VISTAS, default='sin_vista')

    youtube_url = models.URLField(blank=True, null=True)

    # Camas
    numero_camas = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    tipo_cama = models.CharField(max_length=20, choices=TIPOS_CAMA, default='single')

    # Configuración de reservas
    reserva_min_noches = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    reserva_max_noches = models.PositiveIntegerField(default=30, validators=[MinValueValidator(1)])
    permite_mascotas = models.BooleanField(default=False)
    permite_fumar = models.BooleanField(default=False)
    precio_fin_semana = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(0)])

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
