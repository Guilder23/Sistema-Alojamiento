from django.contrib import admin
from .models import Habitacion, AmenidadHabitacion, FotoHabitacion

@admin.register(Habitacion)
class HabitacionAdmin(admin.ModelAdmin):
    list_display = ('numero', 'tipo', 'capacidad', 'precio_noche', 'estado', 'piso')
    list_filter = ('tipo', 'estado', 'piso')
    search_fields = ('numero', 'descripcion')
    readonly_fields = ('creado', 'actualizado')
    fieldsets = (
        ('Información Básica', {
            'fields': ('numero', 'tipo', 'capacidad', 'piso')
        }),
        ('Información de Precios y Estado', {
            'fields': ('precio_noche', 'estado')
        }),
        ('Descripción y Fotos', {
            'fields': ('descripcion', 'foto')
        }),
        ('Fechas', {
            'fields': ('creado', 'actualizado'),
            'classes': ('collapse',)
        }),
    )

@admin.register(AmenidadHabitacion)
class AmenidadHabitacionAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'habitacion')
    list_filter = ('habitacion',)
    search_fields = ('nombre', 'descripcion')

@admin.register(FotoHabitacion)
class FotoHabitacionAdmin(admin.ModelAdmin):
    list_display = ('habitacion', 'descripcion', 'creado')
    list_filter = ('habitacion', 'creado')
    search_fields = ('descripcion',)
