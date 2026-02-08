#!/usr/bin/env python
"""
Script para diagnosticar perfiles de usuario
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_alojamiento.settings')
django.setup()

from django.contrib.auth.models import User
from app.autenticacion.models import PerfilUsuario, Rol

print("=" * 60)
print("DIAGNÓSTICO DE PERFILES")
print("=" * 60 + "\n")

# Listar todos los usuarios
for user in User.objects.all():
    try:
        perfil = user.perfil
        print(f"Usuario: {user.username:20} | Rol: {perfil.rol.nombre:20} | Email: {user.email}")
    except PerfilUsuario.DoesNotExist:
        print(f"Usuario: {user.username:20} | ⚠ SIN PERFIL ⚠")
    except Exception as e:
        print(f"Usuario: {user.username:20} | ERROR: {e}")

print("\n" + "=" * 60)
print(f"Total usuarios: {User.objects.count()}")
print(f"Total perfiles: {PerfilUsuario.objects.count()}")
print("=" * 60)
