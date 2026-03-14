from django.contrib import admin
from .models import Rol, PerfilUsuario, ActividadUsuario

@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ('get_nombre_display', 'activo')
    list_filter = ('activo',)
    search_fields = ('nombre', 'descripcion')

@admin.register(PerfilUsuario)
class PerfilUsuarioAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'rol', 'telefono', 'cedula', 'activo')
    list_filter = ('rol', 'activo', 'fecha_ingreso')
    search_fields = ('usuario__username', 'usuario__email', 'cedula', 'telefono')
    readonly_fields = ('creado', 'actualizado', 'fecha_ingreso')

@admin.register(ActividadUsuario)
class ActividadUsuarioAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'tipo', 'modelo', 'creado')
    list_filter = ('tipo', 'creado', 'usuario')
    search_fields = ('usuario__username', 'descripcion', 'modelo')
    readonly_fields = ('creado',)
