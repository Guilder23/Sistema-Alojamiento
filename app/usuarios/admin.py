"""
Administración de usuarios del sistema.
"""

from django.contrib import admin
from django.contrib.auth.models import User


class UsuariosAdmin(admin.ModelAdmin):
    """Configuración de administración para el modelo Usuario"""
    list_display = ('id',)
