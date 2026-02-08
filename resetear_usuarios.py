#!/usr/bin/env python
"""
Script para resetear usuarios y crear uno por cada rol
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_alojamiento.settings')
django.setup()

from django.contrib.auth.models import User
from app.autenticacion.models import PerfilUsuario, Rol
from app.notificaciones.models import Notificacion

def resetear_usuarios():
    print("=" * 60)
    print("RESETEO DE USUARIOS Y CREACIÓN POR ROL")
    print("=" * 60 + "\n")
    
    # 1. Eliminar todos los datos relacionados en orden correcto
    print("1. Eliminando datos existentes...")
    
    # Primero notificaciones (FK a User)
    notif_count = Notificacion.objects.all().count()
    Notificacion.objects.all().delete()
    print(f"   OK {notif_count} notificaciones eliminadas")
    
    # Luego perfiles (FK a User)
    perfiles_eliminados = PerfilUsuario.objects.all().count()
    PerfilUsuario.objects.all().delete()
    print(f"   OK {perfiles_eliminados} perfiles eliminados")
    
    # Finalmente usuarios
    usuarios_eliminados = User.objects.all().count()
    User.objects.all().delete()
    print(f"   OK {usuarios_eliminados} usuarios eliminados\n")
    
    # 2. Verificar que existen los roles
    print("2. Verificando roles...")
    roles_config = [
        ('administrador', 'Administrador del sistema con acceso total'),
        ('recepcionista', 'Gestiona reservas, pagos y atención al cliente'),
        ('cliente', 'Usuario que realiza reservas de habitaciones'),
        ('gerente', 'Supervisa operaciones, reportes y finanzas'),
        ('empleado_limpieza', 'Personal de limpieza y mantenimiento'),
    ]
    
    for nombre, descripcion in roles_config:
        rol, created = Rol.objects.get_or_create(
            nombre=nombre,
            defaults={'descripcion': descripcion, 'activo': True}
        )
        if created:
            print(f"   OK Rol creado: {rol.get_nombre_display()}")
        else:
            print(f"   - Rol existente: {rol.get_nombre_display()}")
    
    print()
    
    # 3. Crear un usuario por cada rol
    print("3. Creando usuarios por rol...")
    print("-" * 60)
    
    usuarios_config = [
        {
            'username': 'admin',
            'password': 'admin123',
            'email': 'admin@hotel.com',
            'first_name': 'Administrador',
            'last_name': 'Sistema',
            'rol': 'administrador',
            'is_staff': True,
            'is_superuser': True
        },
        {
            'username': 'recepcionista',
            'password': 'recep123',
            'email': 'recepcionista@hotel.com',
            'first_name': 'María',
            'last_name': 'Recepción',
            'rol': 'recepcionista',
            'is_staff': False,
            'is_superuser': False
        },
        {
            'username': 'gerente',
            'password': 'gerente123',
            'email': 'gerente@hotel.com',
            'first_name': 'Carlos',
            'last_name': 'Gerente',
            'rol': 'gerente',
            'is_staff': False,
            'is_superuser': False
        },
        {
            'username': 'limpieza',
            'password': 'limpieza123',
            'email': 'limpieza@hotel.com',
            'first_name': 'Ana',
            'last_name': 'Limpieza',
            'rol': 'empleado_limpieza',
            'is_staff': False,
            'is_superuser': False
        },
        {
            'username': 'cliente',
            'password': 'cliente123',
            'email': 'cliente@hotel.com',
            'first_name': 'Juan',
            'last_name': 'Cliente',
            'rol': 'cliente',
            'is_staff': False,
            'is_superuser': False
        },
    ]
    
    for config in usuarios_config:
        # Crear usuario
        user = User.objects.create_user(
            username=config['username'],
            password=config['password'],
            email=config['email'],
            first_name=config['first_name'],
            last_name=config['last_name'],
            is_staff=config['is_staff'],
            is_superuser=config['is_superuser']
        )
        
        # Obtener rol y crear perfil
        rol = Rol.objects.get(nombre=config['rol'])
        perfil = PerfilUsuario.objects.create(
            usuario=user,
            rol=rol,
            activo=True
        )
        
        print(f"OK {config['username']:15} | {rol.get_nombre_display():25} | {config['email']}")
        print(f"  Password: {config['password']}")
    
    print("-" * 60)
    print(f"\nOK {len(usuarios_config)} usuarios creados exitosamente")
    print("\n" + "=" * 60)
    print("CREDENCIALES DE ACCESO")
    print("=" * 60)
    for config in usuarios_config:
        print(f"Usuario: {config['username']:15} | Contraseña: {config['password']:12} | Rol: {config['rol']}")
    print("=" * 60)

if __name__ == '__main__':
    resetear_usuarios()
