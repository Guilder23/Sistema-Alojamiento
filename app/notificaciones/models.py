from django.db import models
from django.contrib.auth.models import User
from app.reservas.models import Reserva
from app.pagos.models import Pago


class Notificacion(models.Model):
    """Modelo para gestionar notificaciones del sistema"""
    
    TIPOS_NOTIFICACION = [
        ('reserva_nueva', 'Nueva Reserva'),
        ('reserva_confirmada', 'Reserva Confirmada'),
        ('reserva_cancelada', 'Reserva Cancelada'),
        ('pago_pendiente', 'Pago Pendiente'),
        ('pago_recibido', 'Pago Recibido'),
        ('check_in', 'Check-in'),
        ('check_out', 'Check-out'),
        ('mantenimiento', 'Mantenimiento'),
        ('limpieza', 'Limpieza'),
        ('sistema', 'Notificación del Sistema'),
    ]
    
    ESTADOS_NOTIFICACION = [
        ('no_leida', 'No Leída'),
        ('leida', 'Leída'),
        ('archivada', 'Archivada'),
    ]
    
    usuario = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notificaciones',
        help_text="Usuario que recibe la notificación"
    )
    
    tipo = models.CharField(
        max_length=50,
        choices=TIPOS_NOTIFICACION,
        help_text="Tipo de notificación"
    )
    
    titulo = models.CharField(
        max_length=200,
        help_text="Título de la notificación"
    )
    
    mensaje = models.TextField(
        help_text="Mensaje de la notificación"
    )
    
    estado = models.CharField(
        max_length=20,
        choices=ESTADOS_NOTIFICACION,
        default='no_leida'
    )
    
    reserva = models.ForeignKey(
        Reserva,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notificaciones',
        help_text="Reserva relacionada (si aplica)"
    )
    
    pago = models.ForeignKey(
        Pago,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notificaciones',
        help_text="Pago relacionado (si aplica)"
    )
    
    url_accion = models.URLField(
        blank=True,
        null=True,
        help_text="URL para accionar la notificación"
    )
    
    leida_en = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Fecha y hora en que se leyó"
    )
    
    creado = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-creado']
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        indexes = [
            models.Index(fields=['usuario', '-creado']),
            models.Index(fields=['estado', 'usuario']),
        ]
    
    def __str__(self):
        return f"{self.titulo} - {self.usuario.username}"
    
    @property
    def no_leida(self):
        return self.estado == 'no_leida'


class ConfiguracionNotificacion(models.Model):
    """Configuración de preferencias de notificaciones por usuario"""
    
    usuario = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='config_notificaciones',
        help_text="Usuario"
    )
    
    # Reservas
    notificar_nueva_reserva = models.BooleanField(
        default=True,
        help_text="Notificar cuando hay nueva reserva"
    )
    notificar_cambio_reserva = models.BooleanField(
        default=True,
        help_text="Notificar cambios en reservas"
    )
    notificar_cancelacion_reserva = models.BooleanField(
        default=True,
        help_text="Notificar cuando se cancela una reserva"
    )
    
    # Pagos
    notificar_pago_pendiente = models.BooleanField(
        default=True,
        help_text="Notificar pagos pendientes"
    )
    notificar_pago_recibido = models.BooleanField(
        default=True,
        help_text="Notificar cuando se recibe pago"
    )
    
    # Check-in/Check-out
    notificar_check_in = models.BooleanField(
        default=True,
        help_text="Notificar check-in"
    )
    notificar_check_out = models.BooleanField(
        default=True,
        help_text="Notificar check-out"
    )
    
    # Email
    recibir_por_email = models.BooleanField(
        default=False,
        help_text="Recibir notificaciones por correo electrónico"
    )
    
    # Horario
    hora_inicio_notificaciones = models.TimeField(
        default='08:00',
        help_text="Hora de inicio para enviar notificaciones"
    )
    hora_fin_notificaciones = models.TimeField(
        default='22:00',
        help_text="Hora de fin para enviar notificaciones"
    )
    
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Configuración de Notificación'
        verbose_name_plural = 'Configuraciones de Notificaciones'
    
    def __str__(self):
        return f"Config. Notificaciones - {self.usuario.username}"


class HistorialEmail(models.Model):
    """Registro de correos electrónicos enviados"""
    
    ESTADOS_EMAIL = [
        ('pendiente', 'Pendiente'),
        ('enviado', 'Enviado'),
        ('error', 'Error'),
    ]
    
    destinatario = models.EmailField()
    asunto = models.CharField(max_length=200)
    mensaje = models.TextField()
    
    estado = models.CharField(
        max_length=20,
        choices=ESTADOS_EMAIL,
        default='pendiente'
    )
    
    intento = models.PositiveIntegerField(
        default=0,
        help_text="Número de intentos de envío"
    )
    
    mensaje_error = models.TextField(
        blank=True,
        null=True,
        help_text="Mensaje de error si falló"
    )
    
    reserva = models.ForeignKey(
        Reserva,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='emails'
    )
    
    creado = models.DateTimeField(auto_now_add=True)
    enviado_en = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Fecha y hora de envío"
    )
    
    class Meta:
        ordering = ['-creado']
        verbose_name = 'Historial de Email'
        verbose_name_plural = 'Historial de Emails'
    
    def __str__(self):
        return f"{self.asunto} -> {self.destinatario}"
