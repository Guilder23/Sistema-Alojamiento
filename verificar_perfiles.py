#!/usr/bin/env python
"""
Script para verificar y crear perfiles faltantes para usuarios
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_alojamiento.settings')
django.setup()

from django.contrib.auth.models import User
from app.autenticacion.models import PerfilUsuario, Rol

def verificar_y_crear_perfiles():
    """Verifica que todos los usuarios tengan perfil y crea los faltantes"""
    
    print("=" * 60)
    print("VERIFICACIÓN DE PERFILES DE USUARIO")
    print("=" * 60)
    
    usuarios_sin_perfil = []
    usuarios_con_perfil = []
    
    # Verificar todos los usuarios
    for user in User.objects.all():
        try:
            perfil = user.perfil
            usuarios_con_perfil.append({
                'username': user.username,
                'email': user.email,
                'rol': perfil.rol.nombre
            })
            print(f"✓ {user.username} - Rol: {perfil.rol.get_nombre_display()}")
        except PerfilUsuario.DoesNotExist:
            usuarios_sin_perfil.append(user)
            print(f"✗ {user.username} - SIN PERFIL")
    
    print("\n" + "=" * 60)
    print(f"Total usuarios: {User.objects.count()}")
    print(f"Con perfil: {len(usuarios_con_perfil)}")
    print(f"Sin perfil: {len(usuarios_sin_perfil)}")
    print("=" * 60)
    
    # Crear perfiles faltantes
    if usuarios_sin_perfil:
        print("\n¿Crear perfiles para usuarios sin perfil? (s/n): ", end='')
        respuesta = input().lower()
        
        if respuesta == 's':
            # Obtener rol de cliente por defecto
            try:
                rol_cliente = Rol.objects.get(nombre='cliente')
            except Rol.DoesNotExist:
                print("\n⚠ No existe el rol 'cliente'. Creando roles...")
                crear_roles()
                rol_cliente = Rol.objects.get(nombre='cliente')
            
            print(f"\nCreando perfiles con rol '{rol_cliente.get_nombre_display()}'...\n")
            
            for user in usuarios_sin_perfil:
                perfil = PerfilUsuario.objects.create(
                    usuario=user,
                    rol=rol_cliente,
                    activo=True
                )
                print(f"✓ Perfil creado para {user.username}")
            
            print(f"\n✓ Se crearon {len(usuarios_sin_perfil)} perfiles")
    else:
        print("\n✓ Todos los usuarios tienen perfil asignado")
    
    print("\n" + "=" * 60)

def crear_roles():
    """Crea los roles básicos del sistema"""
    roles = [
        ('administrador', 'Usuario con acceso total al sistema'),
        ('recepcionista', 'Gestiona reservas, pagos y clientes'),
        ('cliente', 'Usuario que realiza reservas'),
        ('gerente', 'Supervisa operaciones y reportes'),
        ('empleado_limpieza', 'Gestiona tareas de limpieza'),
    ]
    
    for nombre, descripcion in roles:
        rol, created = Rol.objects.get_or_create(
            nombre=nombre,
            defaults={'descripcion': descripcion, 'activo': True}
        )
        if created:
            print(f"✓ Rol creado: {rol.get_nombre_display()}")

if __name__ == '__main__':
    verificar_y_crear_perfiles()
