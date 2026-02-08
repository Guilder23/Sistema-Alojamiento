from django.contrib import admin
from .models import Pago, MetodoPago

@admin.register(Pago)
class PagoAdmin(admin.ModelAdmin):
    list_display = ('id', 'reserva', 'monto', 'tipo_pago', 'estado', 'fecha_pago')
    list_filter = ('estado', 'tipo_pago', 'fecha_pago')
    search_fields = ('reserva__id', 'reserva__cliente__nombre', 'referencia')
    readonly_fields = ('monto_faltante', 'creado', 'actualizado')
    fieldsets = (
        ('Información del Pago', {
            'fields': ('reserva', 'monto', 'monto_faltante')
        }),
        ('Detalles del Pago', {
            'fields': ('tipo_pago', 'estado', 'fecha_pago')
        }),
        ('Documentación', {
            'fields': ('referencia', 'comprobante')
        }),
        ('Notas y Auditoría', {
            'fields': ('notas', 'creado', 'actualizado'),
            'classes': ('collapse',)
        }),
    )

@admin.register(MetodoPago)
class MetodoPagoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'tipo', 'activo')
    list_filter = ('tipo', 'activo')
    search_fields = ('nombre', 'descripcion')
