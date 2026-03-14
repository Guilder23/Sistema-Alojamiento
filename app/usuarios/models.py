"""
Modelos para la gestión de usuarios del sistema.
"""

from django.db import models


class UsuarioPersonalizado(models.Model):
    """
    Modelo personalizado para información adicional de usuarios.
    """

    class Meta:
        verbose_name = 'Usuario Personalizado'
        verbose_name_plural = 'Usuarios Personalizados'
