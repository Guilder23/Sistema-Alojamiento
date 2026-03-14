from django.db import models
from django.core.validators import RegexValidator

class Cliente(models.Model):
    """Modelo para gestionar los clientes del alojamiento"""
    
    TIPOS_DOCUMENTO = [
        ('ci', 'Cédula de Identidad'),
        ('pasaporte', 'Pasaporte'),
        ('ruc', 'RUC'),
        ('otro', 'Otro'),
    ]
    
    PAISES = [
        ('VE', 'Venezuela'),
        ('CO', 'Colombia'),
        ('PE', 'Perú'),
        ('EC', 'Ecuador'),
        ('BO', 'Bolivia'),
        ('CL', 'Chile'),
        ('AR', 'Argentina'),
        ('BR', 'Brasil'),
        ('MX', 'México'),
        ('OTRO', 'Otro país'),
    ]
    
    nombre = models.CharField(
        max_length=100,
        help_text="Nombre completo del cliente"
    )
    apellido = models.CharField(max_length=100)
    
    tipo_documento = models.CharField(
        max_length=20,
        choices=TIPOS_DOCUMENTO,
        default='ci'
    )
    numero_documento = models.CharField(
        max_length=50,
        unique=True,
        help_text="CI, Pasaporte o RUC"
    )
    
    telefono = models.CharField(
        max_length=20,
        validators=[RegexValidator(r'^[\d\-\+\s]+$', 'Ingrese un teléfono válido')],
        help_text="Número con código de país (+58...)"
    )
    email = models.EmailField(unique=True)
    
    pais = models.CharField(
        max_length=50,
        choices=PAISES,
        default='VE',
        help_text="País de origen del cliente"
    )
    ciudad = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )
    direccion = models.TextField(
        blank=True,
        null=True,
        help_text="Dirección completa"
    )
    
    activo = models.BooleanField(
        default=True,
        help_text="Indicar si el cliente está activo"
    )
    
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['apellido', 'nombre']
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
    
    def __str__(self):
        return f"{self.nombre} {self.apellido} ({self.numero_documento})"
    
    @property
    def nombre_completo(self):
        return f"{self.nombre} {self.apellido}"
