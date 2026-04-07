"""Senales para inicializar roles del sistema."""

from django.db.models.signals import post_migrate
from django.dispatch import receiver

from .models import Rol


@receiver(post_migrate)
def crear_roles_iniciales(sender, **kwargs):
    """Crea los roles base despues de migraciones."""
    if sender.name != "app.autenticacion":
        return

    roles_data = [
        {
            "nombre": "administrador",
            "descripcion": "Acceso total al sistema. Puede crear usuarios, visualizar reportes, gestionar todo.",
        },
        {
            "nombre": "recepcionista",
            "descripcion": "Gestiona reservas, pagos y check-in/check-out. Es el rol principal de atencion al cliente.",
        },
        {
            "nombre": "cliente",
            "descripcion": "Acceso limitado. Solo puede ver sus propias reservas y hacer en linea.",
        },
        {
            "nombre": "gerente",
            "descripcion": "Acceso a reportes, estadisticas y gestion general. Sin acceso a configuracion del sistema.",
        },
        {
            "nombre": "empleado_limpieza",
            "descripcion": "Acceso solo a tareas de limpieza y mantenimiento asignadas.",
        },
    ]

    for rol_data in roles_data:
        Rol.objects.get_or_create(**rol_data)
