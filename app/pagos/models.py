from django.db import models
from django.core.validators import MinValueValidator
from django.contrib.auth.models import User
from app.reservas.models import Reserva
import qrcode
from io import BytesIO
from django.core.files import File
from PIL import Image


class ConfiguracionQR(models.Model):
    """Configuración del QR para pagos"""
    
    ESTADOS_QR = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
    ]
    
    codigo_qr = models.CharField(
        max_length=255,
        help_text="Código QR o datos para generar el QR (puede ser URL, número de cuenta, etc)"
    )
    descripcion = models.CharField(
        max_length=200,
        blank=True,
        help_text="Descripción del método de pago (ej: Transferencia a cuenta 123456)"
    )
    imagen_qr = models.ImageField(
        upload_to='qr_codes/',
        blank=True,
        null=True,
        help_text="Imagen del código QR"
    )
    estado = models.CharField(
        max_length=20,
        choices=ESTADOS_QR,
        default='activo'
    )
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Configuración QR'
        verbose_name_plural = 'Configuraciones QR'
    
    def __str__(self):
        return f"QR Pagos - {self.descripcion}"
    
    def generar_qr(self):
        """Generar imagen QR a partir del código"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(self.codigo_qr)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Guardar la imagen
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        file_name = f'qr_{self.id}.png'
        self.imagen_qr.save(file_name, File(buffer), save=False)
        self.save()


class Pago(models.Model):
    """Modelo para registrar los pagos de las reservas"""
    
    TIPOS_PAGO = [
        ('efectivo', 'Efectivo'),
        ('transferencia', 'Transferencia'),
        ('tarjeta', 'Tarjeta de Crédito/Débito'),
    ]
    
    ESTADOS_PAGO = [
        ('pendiente', 'Pendiente'),
        ('enviado', 'Comprobante Enviado'),
        ('validado', 'Validado'),
        ('rechazado', 'Rechazado'),
        ('reembolsado', 'Reembolsado'),
    ]
    
    ESTADOS_VALIDACION = [
        ('pendiente', 'Pendiente Revisión'),
        ('aprobado', 'Aprobado'),
        ('rechazado', 'Rechazado'),
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
        default='qr',
        help_text="Método de pago utilizado"
    )
    
    estado = models.CharField(
        max_length=20,
        choices=ESTADOS_PAGO,
        default='pendiente'
    )
    
    estado_validacion = models.CharField(
        max_length=20,
        choices=ESTADOS_VALIDACION,
        default='pendiente'
    )
    
    fecha_pago = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha y hora del pago"
    )
    
    # Comprobante enviado por el cliente
    comprobante_cliente = models.ImageField(
        upload_to='pagos/comprobantes_cliente/%Y/%m/',
        blank=True,
        null=True,
        help_text="Comprobante de transferencia enviado por cliente"
    )
    
    # Comprobante/referencia de validación
    comprobante = models.FileField(
        upload_to='pagos/comprobantes/%Y/%m/',
        blank=True,
        null=True,
        help_text="Comprobante de pago validado"
    )
    
    # Validación por recepcionista
    validado_por = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='pagos_validados',
        help_text="Recepcionista que validó el pago"
    )
    
    fecha_validacion = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha de validación del pago"
    )
    
    comentario_validacion = models.TextField(
        blank=True,
        null=True,
        help_text="Comentarios o razón de rechazo"
    )
    
    referencia_transaccion = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Referencia de transferencia o número de confirmación"
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
