# coding: utf-8
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_alojamiento.settings')
django.setup()

from django.contrib.auth.models import User
from app.autenticacion.models import PerfilUsuario, Rol

print("Creando roles del sistema...")
roles_config = [
    ('administrador', 'Administrador del sistema con acceso total'),
    ('recepcionista', 'Gestiona reservas, pagos y atencion al cliente'),
    ('cliente', 'Usuario que realiza reservas de habitaciones'),
    ('gerente', 'Supervisa operaciones, reportes y finanzas'),
    ('empleado_limpieza', 'Personal de limpieza y mantenimiento'),
]

for nombre, descripcion in roles_config:
    Rol.objects.get_or_create(
        nombre=nombre,
        defaults={'descripcion': descripcion, 'activo': True}
    )
    print(f"  - Rol: {nombre}")

print("\nCreando usuarios...")
usuarios = [
    {'username': 'admin', 'password': 'admin123', 'email': 'admin@hotel.com',
     'first_name': 'Administrador', 'last_name': 'Sistema', 'rol': 'administrador',
     'is_staff': True, 'is_superuser': True},
    {'username': 'recepcionista', 'password': 'recep123', 'email': 'recepcionista@hotel.com',
     'first_name': 'Maria', 'last_name': 'Recepcion', 'rol': 'recepcionista'},
    {'username': 'gerente', 'password': 'gerente123', 'email': 'gerente@hotel.com',
     'first_name': 'Carlos', 'last_name': 'Gerente', 'rol': 'gerente'},
    {'username': 'limpieza', 'password': 'limpieza123', 'email': 'limpieza@hotel.com',
     'first_name': 'Ana', 'last_name': 'Limpieza', 'rol': 'empleado_limpieza'},
    {'username': 'cliente', 'password': 'cliente123', 'email': 'cliente@hotel.com',
     'first_name': 'Juan', 'last_name': 'Cliente', 'rol': 'cliente'},
]

for config in usuarios:
    user = User.objects.create_user(
        username=config['username'],
        password=config['password'],
        email=config['email'],
        first_name=config['first_name'],
        last_name=config['last_name'],
        is_staff=config.get('is_staff', False),
        is_superuser=config.get('is_superuser', False)
    )
    
    rol = Rol.objects.get(nombre=config['rol'])
    PerfilUsuario.objects.create(usuario=user, rol=rol, activo=True)
    
    print(f"  OK {config['username']:15} | Rol: {config['rol']:20} | Pass: {config['password']}")

print("\n" + "=" * 60)
print(" CREDENCIALES DE ACCESO")
print("=" * 60)
for u in usuarios:
    print(f"  {u['username']:15} | {u['password']:12} | {u['rol']}")
print("=" * 60)
