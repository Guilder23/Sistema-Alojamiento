#!/usr/bin/env python
"""
Script para asignar roles correctos a los usuarios
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_alojamiento.settings')
django.setup()

from django.contrib.auth.models import User
from app.autenticacion.models import PerfilUsuario, Rol

# Mapeo de usuarios a roles
ASIGNACIONES = {
    'admin': 'administrador',
    'recepcionista': 'recepcionista',
    'recepcion': 'recepcionista',
    'gerente': 'gerente',
    'limpieza': 'empleado_limpieza',
    'empleado': 'empleado_limpieza',
    'cliente': 'cliente',
    'cliente_test': 'cliente',
    'cliente_demo': 'cliente',
}

print("=" * 60)
print("ASIGNACIÓN DE ROLES CORRECTOS")
print("=" * 60 + "\n")

# Procesar cada usuario
actualizados = 0
for username, rol_nombre in ASIGNACIONES.items():
    try:
        user = User.objects.get(username=username)
        rol = Rol.objects.get(nombre=rol_nombre)
        
        # Actualizar el perfil
        perfil = user.perfil
        if perfil.rol.nombre != rol_nombre:
            perfil.rol = rol
            perfil.save()
            print(f"✓ {username:20} -> {rol.get_nombre_display()}")
            actualizados += 1
        else:
            print(f"  {username:20} (ya tiene {rol.get_nombre_display()})")
    except User.DoesNotExist:
        print(f"✗ Usuario '{username}' no existe")
    except Rol.DoesNotExist:
        print(f"✗ Rol '{rol_nombre}' no existe")
    except Exception as e:
        print(f"✗ Error con {username}: {e}")

print("\n" + "=" * 60)
print(f"Usuarios actualizados: {actualizados}")
print("=" * 60)

# Mostrar resumen final
print("\nRESUMEN FINAL:")
print("-" * 60)
for user in User.objects.filter(username__in=ASIGNACIONES.keys()).order_by('username'):
    try:
        print(f"{user.username:20} | {user.perfil.rol.get_nombre_display()}")
    except:
        print(f"{user.username:20} | ERROR")
print("=" * 60)
