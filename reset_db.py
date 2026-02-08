# coding: utf-8
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_alojamiento.settings')
django.setup()

from django.contrib.auth.models import User
from app.autenticacion.models import PerfilUsuario, Rol
from django.core.management import call_command

print("=" * 60)
print(" RESETEO COMPLETO DE BASE DE DATOS")
print("=" * 60 + "\n")

# Usar flush para limpiar todo 
print("Limpiando base de datos...")
call_command('flush', '--no-input')
print("OK Base de datos limpiada\n")

# Crear roles
print("Creando roles...")
roles_config = [
    ('administrador', 'Administrador del sistema con acceso total'),
    ('recepcionista', 'Gestiona reservas, pagos y atencion al cliente'),
    ('cliente', 'Usuario que realiza reservas de habitaciones'),
    ('gerente', 'Supervisa operaciones, reportes y finanzas'),
    ('empleado_limpieza', 'Personal de limpieza y mantenimiento'),
]

for nombre, descripcion in roles_config:
    Rol.objects.create(nombre=nombre, descripcion=descripcion, activo=True)
    print(f"  OK Rol: {nombre}")

print()

# Crear usuarios
print("Creando usuarios...")
usuarios = [
    {'username': 'admin', 'password': 'admin123', 'email': 'admin@hotel.com',
     'first_name': 'Administrador', 'last_name': 'Sistema', 'rol': 'administrador',
     'is_staff': True, 'is_superuser': True},
    {'username': 'recepcionista', 'password': 'recep123', 'email': 'recepcionista@hotel.com',
     'first_name': 'Maria', 'last_name': 'Recepcion', 'rol': 'recepcionista',
     'is_staff': False, 'is_superuser': False},
    {'username': 'gerente', 'password': 'gerente123', 'email': 'gerente@hotel.com',
     'first_name': 'Carlos', 'last_name': 'Gerente', 'rol': 'gerente',
     'is_staff': False, 'is_superuser': False},
    {'username': 'limpieza', 'password': 'limpieza123', 'email': 'limpieza@hotel.com',
     'first_name': 'Ana', 'last_name': 'Limpieza', 'rol': 'empleado_limpieza',
     'is_staff': False, 'is_superuser': False},
    {'username': 'cliente', 'password': 'cliente123', 'email': 'cliente@hotel.com',
     'first_name': 'Juan', 'last_name': 'Cliente', 'rol': 'cliente',
     'is_staff': False, 'is_superuser': False},
]

for config in usuarios:
    user = User.objects.create_user(
        username=config['username'],
        password=config['password'],
        email=config['email'],
        first_name=config['first_name'],
        last_name=config['last_name'],
        is_staff=config['is_staff'],
        is_superuser=config['is_superuser']
    )
    
    rol = Rol.objects.get(nombre=config['rol'])
    PerfilUsuario.objects.create(usuario=user, rol=rol, activo=True)
    
    print(f"  OK {config['username']:15} | {config['rol']:20} | pwd: {config['password']}")

print("\n" + "=" * 60)
print(" USUARIOS CREADOS EXITOSAMENTE")
print("=" * 60)
for u in usuarios:
    print(f"  User: {u['username']:15} | Pass: {u['password']:12} | Rol: {u['rol']}")
print("=" * 60)
