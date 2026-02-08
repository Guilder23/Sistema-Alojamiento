from django.contrib import admin
from .models import ConfiguracionSitio, Servicio, Testimonio, Galeria, Politica

@admin.register(ConfiguracionSitio)
class ConfiguracionSitioAdmin(admin.ModelAdmin):
    list_display = ('nombre_hotel', 'email', 'telefono', 'ciudad')
    fieldsets = (
        ('Información General', {
            'fields': ('nombre_hotel', 'descripcion')
        }),
        ('Contacto', {
            'fields': ('email', 'telefono', 'whatsapp')
        }),
        ('Ubicación', {
            'fields': ('direccion', 'ciudad', 'pais', 'latitud', 'longitud')
        }),
        ('Visual', {
            'fields': ('logo', 'foto_principal')
        }),
        ('Redes Sociales', {
            'fields': ('redes_sociales',)
        }),
    )

@admin.register(Servicio)
class ServicioAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'orden', 'activo')
    list_filter = ('activo',)
    search_fields = ('nombre', 'descripcion')

@admin.register(Testimonio)
class TestimonioAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'calificacion', 'aprobado', 'creado')
    list_filter = ('aprobado', 'calificacion', 'creado')
    search_fields = ('nombre', 'email', 'contenido')

@admin.register(Galeria)
class GaleriaAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'categoria', 'orden', 'activa')
    list_filter = ('categoria', 'activa')
    search_fields = ('titulo', 'descripcion')

@admin.register(Politica)
class PoliticaAdmin(admin.ModelAdmin):
    list_display = ('get_tipo_display', 'titulo', 'activa')
    list_filter = ('activa', 'tipo')
    search_fields = ('titulo', 'contenido')
