from django.db import models
from django.contrib.auth.models import User
from app.habitaciones.models import Habitacion


class TareaLimpieza(models.Model):
    """Modelo para registrar tareas de limpieza de habitaciones"""
    
    PRIORIDADES = [
        ('alta', 'Alta'),
        ('media', 'Media'),
        ('baja', 'Baja'),
    ]
    
    ESTADOS_TAREA = [
        ('pendiente', 'Pendiente'),
        ('en_progreso', 'En Progreso'),
        ('completada', 'Completada'),
        ('cancelada', 'Cancelada'),
    ]
    
    habitacion = models.ForeignKey(
        Habitacion,
        on_delete=models.CASCADE,
        related_name='tareas_limpieza',
        help_text="Habitación a limpiar"
    )
    
    asignado_a = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tareas_limpieza',
        help_text="Empleado responsable de la limpieza"
    )
    
    fecha_programada = models.DateField(
        help_text="Fecha programada para la limpieza"
    )
    
    hora_inicio = models.TimeField(
        blank=True,
        null=True,
        help_text="Hora de inicio de la limpieza"
    )
    
    hora_fin = models.TimeField(
        blank=True,
        null=True,
        help_text="Hora de finalización de la limpieza"
    )
    
    prioridad = models.CharField(
        max_length=10,
        choices=PRIORIDADES,
        default='media'
    )
    
    estado = models.CharField(
        max_length=20,
        choices=ESTADOS_TAREA,
        default='pendiente'
    )
    
    descripcion = models.TextField(
        blank=True,
        null=True,
        help_text="Notas especiales para la limpieza"
    )
    
    notas_completa = models.TextField(
        blank=True,
        null=True,
        help_text="Observaciones de cómo quedó la habitación"
    )
    
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['fecha_programada', '-prioridad']
        verbose_name = 'Tarea de Limpieza'
        verbose_name_plural = 'Tareas de Limpieza'
    
    def __str__(self):
        return f"Limpieza {self.habitacion.numero} - {self.fecha_programada}"


class Mantenimiento(models.Model):
    """Modelo para registrar tareas de mantenimiento"""
    
    TIPOS_MANTENIMIENTO = [
        ('preventivo', 'Preventivo'),
        ('correctivo', 'Correctivo'),
        ('emergencia', 'Emergencia'),
    ]
    
    ESTADOS_MANTENIMIENTO = [
        ('pendiente', 'Pendiente'),
        ('en_progreso', 'En Progreso'),
        ('completado', 'Completado'),
        ('cancelado', 'Cancelado'),
    ]
    
    habitacion = models.ForeignKey(
        Habitacion,
        on_delete=models.CASCADE,
        related_name='mantenimientos',
        help_text="Habitación a mantener"
    )
    
    tipo = models.CharField(
        max_length=20,
        choices=TIPOS_MANTENIMIENTO,
        default='preventivo'
    )
    
    descripcion = models.TextField(
        help_text="Descripción del problema o tarea de mantenimiento"
    )
    
    estado = models.CharField(
        max_length=20,
        choices=ESTADOS_MANTENIMIENTO,
        default='pendiente'
    )
    
    asignado_a = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='mantenimientos',
        help_text="Técnico responsable"
    )
    
    fecha_inicio = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Fecha y hora de inicio"
    )
    
    fecha_fin = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Fecha y hora de finalización"
    )
    
    costo = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Costo del mantenimiento"
    )
    
    notas_resolucion = models.TextField(
        blank=True,
        null=True,
        help_text="Acción tomada para resolver el problema"
    )
    
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-creado']
        verbose_name = 'Mantenimiento'
        verbose_name_plural = 'Mantenimientos'
    
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.habitacion.numero}"


class BloqueoHabitacion(models.Model):
    """Modelo para bloquear temporalmente habitaciones"""
    
    RAZONES_BLOQUEO = [
        ('mantenimiento', 'Mantenimiento'),
        ('limpieza_profunda', 'Limpieza Profunda'),
        ('renovacion', 'Renovación'),
        ('problema', 'Problema Técnico'),
        ('otro', 'Otro'),
    ]
    
    habitacion = models.ForeignKey(
        Habitacion,
        on_delete=models.CASCADE,
        related_name='bloqueos',
        help_text="Habitación bloqueada"
    )
    
    fecha_inicio = models.DateField(
        help_text="Fecha de inicio del bloqueo"
    )
    
    fecha_fin = models.DateField(
        help_text="Fecha de fin del bloqueo"
    )
    
    razon = models.CharField(
        max_length=50,
        choices=RAZONES_BLOQUEO,
        default='otro'
    )
    
    descripcion = models.TextField(
        blank=True,
        null=True,
        help_text="Detalles del bloqueo"
    )
    
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['fecha_inicio']
        verbose_name = 'Bloqueo de Habitación'
        verbose_name_plural = 'Bloqueos de Habitaciones'
    
    def __str__(self):
        return f"Bloqueo {self.habitacion.numero} ({self.fecha_inicio} - {self.fecha_fin})"
