from django.db import models


class ConfiguracionSitio(models.Model):
    """Configuración general del sitio público"""
    
    nombre_hotel = models.CharField(
        max_length=200,
        default='Sistema de Alojamiento',
        help_text="Nombre del hotel"
    )
    
    descripcion = models.TextField(
        help_text="Descripción del hotel"
    )
    
    email = models.EmailField(
        help_text="Correo de contacto"
    )
    
    telefono = models.CharField(
        max_length=20,
        help_text="Teléfono de contacto"
    )
    
    whatsapp = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Número de WhatsApp"
    )
    
    direccion = models.TextField(
        help_text="Dirección física del hotel"
    )
    
    ciudad = models.CharField(max_length=100)
    pais = models.CharField(max_length=100)
    
    latitud = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        blank=True,
        null=True,
        help_text="Latitud para Google Maps"
    )
    
    longitud = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        blank=True,
        null=True,
        help_text="Longitud para Google Maps"
    )
    
    logo = models.ImageField(
        upload_to='sitio/logo/',
        blank=True,
        null=True,
        help_text="Logo del hotel"
    )
    
    foto_principal = models.ImageField(
        upload_to='sitio/fotos/',
        blank=True,
        null=True,
        help_text="Foto principal del hotel"
    )
    
    redes_sociales = models.JSONField(
        default=dict,
        blank=True,
        help_text="Enlaces a redes sociales (Facebook, Instagram, etc)"
    )
    
    actualizado = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Configuración del Sitio'
        verbose_name_plural = 'Configuración del Sitio'
    
    def __str__(self):
        return self.nombre_hotel


class Servicio(models.Model):
    """Servicios disponibles en el hotel"""
    
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    icono = models.CharField(
        max_length=50,
        default='fas fa-star',
        help_text="Clase de Font Awesome (ej: fas fa-wifi)"
    )
    imagen = models.ImageField(
        upload_to='servicios/',
        blank=True,
        null=True
    )
    activo = models.BooleanField(default=True)
    orden = models.PositiveIntegerField(
        default=0,
        help_text="Orden de aparición en el sitio"
    )
    
    class Meta:
        ordering = ['orden']
        verbose_name = 'Servicio'
        verbose_name_plural = 'Servicios'
    
    def __str__(self):
        return self.nombre


class Testimonio(models.Model):
    """Testimonios de clientes para mostrar en la página pública"""
    
    nombre = models.CharField(max_length=100)
    email = models.EmailField()
    titulo = models.CharField(
        max_length=200,
        help_text="Título del testimonio"
    )
    contenido = models.TextField()
    calificacion = models.PositiveIntegerField(
        choices=[(i, str(i)) for i in range(1, 6)],
        default=5,
        help_text="Calificación de 1 a 5 estrellas"
    )
    foto = models.ImageField(
        upload_to='testimonios/fotos/',
        blank=True,
        null=True
    )
    aprobado = models.BooleanField(
        default=False,
        help_text="Mostrar testimonio en el sitio público"
    )
    creado = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-creado']
        verbose_name = 'Testimonio'
        verbose_name_plural = 'Testimonios'
    
    def __str__(self):
        return f"{self.nombre} - {self.calificacion} ⭐"


class Galeria(models.Model):
    """Galería de fotos del hotel"""
    
    CATEGORIAS = [
        ('exterior', 'Exterior'),
        ('lobby', 'Lobby/Recepción'),
        ('habitaciones', 'Habitaciones'),
        ('restaurante', 'Restaurante'),
        ('piscina', 'Piscina'),
        ('eventos', 'Eventos'),
        ('otro', 'Otro'),
    ]
    
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    categoria = models.CharField(
        max_length=50,
        choices=CATEGORIAS,
        default='otro'
    )
    foto = models.ImageField(upload_to='galeria/%Y/%m/')
    orden = models.PositiveIntegerField(
        default=0,
        help_text="Orden de aparición"
    )
    activa = models.BooleanField(default=True)
    creado = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['categoria', 'orden']
        verbose_name = 'Foto de Galería'
        verbose_name_plural = 'Fotos de Galería'
    
    def __str__(self):
        return f"{self.titulo} ({self.get_categoria_display()})"


class Politica(models.Model):
    """Políticas del hotel (cancelación, check-in, etc)"""
    
    TIPOS_POLITICA = [
        ('cancelacion', 'Política de Cancelación'),
        ('checkin', 'Política de Check-in'),
        ('checkout', 'Política de Check-out'),
        ('ninos', 'Política de Niños'),
        ('mascotas', 'Política de Mascotas'),
        ('general', 'Términos y Condiciones'),
    ]
    
    tipo = models.CharField(
        max_length=50,
        choices=TIPOS_POLITICA,
        unique=True
    )
    titulo = models.CharField(max_length=200)
    contenido = models.TextField()
    activa = models.BooleanField(default=True)
    actualizado = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Política'
        verbose_name_plural = 'Políticas'
    
    def __str__(self):
        return f"{self.get_tipo_display()}"
