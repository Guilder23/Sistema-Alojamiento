"""
Archivo de utilidades para la aplicación de usuarios
Contiene scripts para carga inicial de datos
"""

from app.autenticacion.models import Rol


def crear_roles_iniciales():
    """Crea los roles iniciales del sistema"""
    roles_data = [
        {
            'nombre': 'administrador',
            'descripcion': 'Acceso total al sistema. Puede crear usuarios, visualizar reportes, gestionar todo.'
        },
        {
            'nombre': 'recepcionista',
            'descripcion': 'Gestiona reservas, pagos y check-in/check-out. Es el rol principal de atención al cliente.'
        },
        {
            'nombre': 'cliente',
            'descripcion': 'Acceso limitado. Solo puede ver sus propias reservas y hacer en línea.'
        },
        {
            'nombre': 'gerente',
            'descripcion': 'Acceso a reportes, estadísticas y gestión general. Sin acceso a configuración del sistema.'
        },
        {
            'nombre': 'empleado_limpieza',
            'descripcion': 'Acceso solo a tareas de limpieza y mantenimiento asignadas.'
        },
    ]
    
    for rol_data in roles_data:
        rol, creado = Rol.objects.get_or_create(**rol_data)
        if creado:
            print(f"✅ Rol '{rol.get_nombre_display()}' creado exitosamente")
        else:
            print(f"ℹ️  Rol '{rol.get_nombre_display()}' ya existía")


if __name__ == '__main__':
    crear_roles_iniciales()
