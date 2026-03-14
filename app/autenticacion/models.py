from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator


class Rol(models.Model):
    """Modelo para definir roles en el sistema"""
    
    TIPOS_ROL = [
        ('administrador', 'Administrador'),
        ('recepcionista', 'Recepcionista'),
        ('cliente', 'Cliente'),
        ('gerente', 'Gerente'),
        ('empleado_limpieza', 'Empleado de Limpieza'),
    ]
    
    nombre = models.CharField(
        max_length=50,
        choices=TIPOS_ROL,
        unique=True
    )
    descripcion = models.TextField(
        help_text="Descripción de los permisos y responsabilidades del rol"
    )
    activo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = 'Rol'
        verbose_name_plural = 'Roles'
    
    def __str__(self):
        return self.get_nombre_display()


class PerfilUsuario(models.Model):
    """Perfil extendido del usuario con información adicional"""
    
    usuario = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='perfil',
        help_text="Usuario del sistema"
    )
    
    rol = models.ForeignKey(
        Rol,
        on_delete=models.PROTECT,
        related_name='usuarios',
        help_text="Rol del usuario en el sistema"
    )
    
    telefono = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        validators=[RegexValidator(r'^[\d\-\+\s]+$', 'Ingrese un teléfono válido')]
    )
    
    celular = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        validators=[RegexValidator(r'^[\d\-\+\s]+$', 'Ingrese un celular válido')]
    )
    
    cedula = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        unique=True,
        help_text="Cédula de identidad del empleado"
    )
    
    foto_perfil = models.ImageField(
        upload_to='usuarios/fotos/%Y/%m/',
        blank=True,
        null=True,
        help_text="Foto de perfil del usuario"
    )
    
    activo = models.BooleanField(
        default=True,
        help_text="Indicar si el usuario está activo"
    )
    
    fecha_ingreso = models.DateField(
        auto_now_add=True,
        help_text="Fecha de ingreso al sistema"
    )
    
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Perfil de Usuario'
        verbose_name_plural = 'Perfiles de Usuarios'
    
    def __str__(self):
        return f"{self.usuario.get_full_name()} ({self.rol.get_nombre_display()})"
    
    @property
    def es_administrador(self):
        return self.rol.nombre == 'administrador'
    
    @property
    def es_recepcionista(self):
        return self.rol.nombre == 'recepcionista'
    
    @property
    def es_cliente(self):
        return self.rol.nombre == 'cliente'
    
    @property
    def es_gerente(self):
        return self.rol.nombre == 'gerente'
    
    @property
    def es_empleado_limpieza(self):
        return self.rol.nombre == 'empleado_limpieza'


class ActividadUsuario(models.Model):
    """Registro de actividades de los usuarios para auditoría"""
    
    TIPOS_ACTIVIDAD = [
        ('login', 'Inicio de Sesión'),
        ('logout', 'Cierre de Sesión'),
        ('crear', 'Crear'),
        ('editar', 'Editar'),
        ('eliminar', 'Eliminar'),
        ('actualizar', 'Actualizar'),
    ]
    
    usuario = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='actividades'
    )
    
    tipo = models.CharField(
        max_length=20,
        choices=TIPOS_ACTIVIDAD
    )
    
    modelo = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Modelo afectado por la actividad"
    )
    
    id_objeto = models.PositiveIntegerField(
        blank=True,
        null=True,
        help_text="ID del objeto modificado"
    )
    
    descripcion = models.TextField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    
    creado = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-creado']
        verbose_name = 'Actividad de Usuario'
        verbose_name_plural = 'Actividades de Usuarios'
    
    def __str__(self):
        return f"{self.usuario} - {self.get_tipo_display()} ({self.creado})"
