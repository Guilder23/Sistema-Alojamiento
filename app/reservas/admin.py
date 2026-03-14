from django.contrib import admin
from .models import Reserva, HistorialReserva

class HistorialReservaInline(admin.TabularInline):
    model = HistorialReserva
    readonly_fields = ('cambio', 'estado_anterior', 'estado_nuevo', 'creado')
    can_delete = False
    extra = 0

@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = ('id', 'cliente', 'habitacion', 'fecha_entrada', 'fecha_salida', 'estado', 'precio_total')
    list_filter = ('estado', 'fecha_entrada', 'habitacion')
    search_fields = ('cliente__nombre', 'cliente__apellido', 'habitacion__numero')
    readonly_fields = ('precio_total', 'noches', 'creado', 'actualizado')
    inlines = [HistorialReservaInline]
    fieldsets = (
        ('Información de Reserva', {
            'fields': ('habitacion', 'cliente', 'num_huespedes')
        }),
        ('Fechas', {
            'fields': ('fecha_entrada', 'fecha_salida', 'noches')
        }),
        ('Pago', {
            'fields': ('precio_total', 'estado')
        }),
        ('Notas', {
            'fields': ('notas',)
        }),
        ('Auditoría', {
            'fields': ('creado', 'actualizado'),
            'classes': ('collapse',)
        }),
    )

@admin.register(HistorialReserva)
class HistorialReservaAdmin(admin.ModelAdmin):
    list_display = ('reserva', 'cambio', 'estado_anterior', 'estado_nuevo', 'creado')
    list_filter = ('creado', 'reserva')
    search_fields = ('reserva__id', 'cambio')
    readonly_fields = ('creado',)
