from django.db import models
from django.db.models import Sum, Count
from django.utils import timezone
from app.reservas.models import Reserva
from app.habitaciones.models import Habitacion
from app.clientes.models import Cliente


class Estadistica(models.Model):
    """Modelo para almacenar estadísticas del sistema"""
    
    PERIODOS = [
        ('diaria', 'Diaria'),
        ('semanal', 'Semanal'),
        ('mensual', 'Mensual'),
        ('anual', 'Anual'),
    ]
    
    periodo = models.CharField(
        max_length=20,
        choices=PERIODOS,
        help_text="Período de la estadística"
    )
    
    fecha = models.DateField(
        auto_now_add=True,
        help_text="Fecha de la estadística"
    )
    
    # Reservas
    total_reservas = models.PositiveIntegerField(
        default=0,
        help_text="Total de reservas"
    )
    reservas_confirmadas = models.PositiveIntegerField(
        default=0,
        help_text="Reservas confirmadas"
    )
    reservas_canceladas = models.PositiveIntegerField(
        default=0,
        help_text="Reservas canceladas"
    )
    
    # Ingresos
    ingresos_totales = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Ingresos totales"
    )
    
    # Ocupación
    porcentaje_ocupacion = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text="Porcentaje de ocupación"
    )
    
    # Clientes
    clientes_nuevos = models.PositiveIntegerField(
        default=0,
        help_text="Clientes nuevos"
    )
    
    notas = models.TextField(
        blank=True,
        null=True,
        help_text="Notas especiales"
    )
    
    creado = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-fecha']
        verbose_name = 'Estadística'
        verbose_name_plural = 'Estadísticas'
    
    def __str__(self):
        return f"Estadística {self.get_periodo_display()} - {self.fecha}"


class ReporteOcupacion(models.Model):
    """Reporte detallado de ocupación por habitación"""
    
    habitacion = models.ForeignKey(
        Habitacion,
        on_delete=models.CASCADE,
        related_name='reportes_ocupacion'
    )
    
    fecha = models.DateField(
        auto_now_add=True,
        help_text="Fecha del reporte"
    )
    
    ocupada = models.BooleanField(
        default=False,
        help_text="Si la habitación está ocupada"
    )
    
    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Cliente que ocupa la habitación"
    )
    
    reserva = models.ForeignKey(
        Reserva,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Reserva asociada"
    )
    
    class Meta:
        ordering = ['-fecha', 'habitacion']
        verbose_name = 'Reporte de Ocupación'
        verbose_name_plural = 'Reportes de Ocupación'
    
    def __str__(self):
        estado = "Ocupada" if self.ocupada else "Disponible"
        return f"{self.habitacion.numero} - {self.fecha} ({estado})"


class ReporteIngresos(models.Model):
    """Reporte de ingresos por período"""
    
    PERIODOS = [
        ('diario', 'Diario'),
        ('semanal', 'Semanal'),
        ('mensual', 'Mensual'),
        ('anual', 'Anual'),
    ]
    
    periodo = models.CharField(
        max_length=20,
        choices=PERIODOS,
        default='mensual'
    )
    
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    
    ingresos_reservas = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Ingresos de reservas"
    )
    
    ingresos_adicionales = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Ingresos adicionales (servicios extra, etc)"
    )
    
    total_ingresos = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Ingresos totales"
    )
    
    total_gastos = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Gastos (mantenimiento, etc)"
    )
    
    ganancia_neta = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Ganancia neta"
    )
    
    creado = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-fecha_inicio']
        verbose_name = 'Reporte de Ingresos'
        verbose_name_plural = 'Reportes de Ingresos'
    
    def __str__(self):
        return f"Ingresos {self.get_periodo_display()} ({self.fecha_inicio}-{self.fecha_fin})"


class ReporteClientesFrecuentes(models.Model):
    """Reporte de clientes frecuentes"""
    
    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.CASCADE,
        related_name='reportes_frecuencia'
    )
    
    total_reservas = models.PositiveIntegerField(
        default=0,
        help_text="Total de reservas realizadas"
    )
    
    total_noches = models.PositiveIntegerField(
        default=0,
        help_text="Total de noches hospedadas"
    )
    
    gasto_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Gasto total en reservas"
    )
    
    fecha_primera_reserva = models.DateField(
        blank=True,
        null=True,
        help_text="Fecha de la primera reserva"
    )
    
    fecha_ultima_reserva = models.DateField(
        blank=True,
        null=True,
        help_text="Fecha de la última reserva"
    )
    
    creado = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-total_reservas']
        verbose_name = 'Cliente Frecuente'
        verbose_name_plural = 'Clientes Frecuentes'
    
    def __str__(self):
        return f"{self.cliente.nombre_completo} ({self.total_reservas} reservas)"
