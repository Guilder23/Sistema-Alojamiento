from django.contrib import admin
from .models import Cliente

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('nombre_completo', 'numero_documento', 'email', 'telefono', 'pais', 'activo')
    list_filter = ('activo', 'pais', 'creado')
    search_fields = ('nombre', 'apellido', 'email', 'numero_documento', 'telefono')
    readonly_fields = ('creado', 'actualizado')
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'apellido')
        }),
        ('Documentación', {
            'fields': ('tipo_documento', 'numero_documento')
        }),
        ('Contacto', {
            'fields': ('email', 'telefono', 'whatsapp')
        }),
        ('Ubicación', {
            'fields': ('pais', 'ciudad', 'direccion')
        }),
        ('Estado', {
            'fields': ('activo',)
        }),
        ('Fechas', {
            'fields': ('creado', 'actualizado'),
            'classes': ('collapse',)
        }),
    )
