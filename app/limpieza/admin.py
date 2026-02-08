from django.contrib import admin
from .models import TareaLimpieza, Mantenimiento, BloqueoHabitacion

@admin.register(TareaLimpieza)
class TareaLimpiezaAdmin(admin.ModelAdmin):
    list_display = ('habitacion', 'fecha_programada', 'prioridad', 'estado', 'asignado_a')
    list_filter = ('estado', 'prioridad', 'fecha_programada')
    search_fields = ('habitacion__numero', 'descripcion')
    readonly_fields = ('creado', 'actualizado')

@admin.register(Mantenimiento)
class MantenimientoAdmin(admin.ModelAdmin):
    list_display = ('habitacion', 'tipo', 'estado', 'asignado_a', 'costo')
    list_filter = ('tipo', 'estado', 'fecha_inicio')
    search_fields = ('habitacion__numero', 'descripcion')
    readonly_fields = ('creado', 'actualizado')

@admin.register(BloqueoHabitacion)
class BloqueoHabitacionAdmin(admin.ModelAdmin):
    list_display = ('habitacion', 'fecha_inicio', 'fecha_fin', 'razon')
    list_filter = ('razon', 'fecha_inicio')
    search_fields = ('habitacion__numero', 'descripcion')
