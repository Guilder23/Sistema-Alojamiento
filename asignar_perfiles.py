# coding: utf-8
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_alojamiento.settings')
django.setup()

from django.contrib.auth.models import User
from app.autenticacion.models import PerfilUsuario, Rol

# Mapeo de usuarios a roles
MAP_ROLES = {
    'admin': 'administrador',
    'recepcionista': 'recepcionista',
    'recepcion': 'recepcionista',
    'gerente': 'gerente',
    'limpieza': 'empleado_limpieza',
    'empleado': 'empleado_limpieza',
    # Resto son cl clientes
}

print("=" * 60)
print(" ASIGNAR PERFILES A USUARIOS")
print("=" * 60 + "\n")

# Asegurar que existen los roles
print("Verificando roles...")
Rol.objects.get_or_create(nombre='administrador', defaults={'descripcion': 'Administrador', 'activo': True})
Rol.objects.get_or_create(nombre='recepcionista', defaults={'descripcion': 'Recepcionista', 'activo': True})
Rol.objects.get_or_create(nombre='gerente', defaults={'descripcion': 'Gerente', 'activo': True})
Rol.objects.get_or_create(nombre='empleado_limpieza', defaults={'descripcion': 'Limpieza', 'activo': True})
Rol.objects.get_or_create(nombre='cliente', defaults={'descripcion': 'Cliente', 'activo': True})
print("OK Roles verificados\n")

print("Asignando perfiles...")
for user in User.objects.all():
    try:
        perfil = user.perfil
        print(f"  - {user.username:20} ya tiene perfil ({perfil.rol.nombre})")
    except PerfilUsuario.DoesNotExist:
        # Determinar rol según username
        rol_nombre = MAP_ROLES.get(user.username, 'cliente')
        rol = Rol.objects.get(nombre=rol_nombre)
        
        # Crear perfil
        PerfilUsuario.objects.create(usuario=user, rol=rol, activo=True)
        print(f"  OK {user.username:20} -> {rol.get_nombre_display()}")

print("\n" + "=" * 60)
print(" VERIFICACIÓN FINAL")
print("=" * 60)
for user in User.objects.all():
    try:
        print(f"  {user.username:20} | {user.perfil.rol.nombre}")
    except:
        print(f"  {user.username:20} | ERROR")
print("=" * 60)
