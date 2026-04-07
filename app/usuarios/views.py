"""
Vistas para la gestión de usuarios del sistema.
Incluye tanto vistas tradicionales como API endpoints para AJAX.
"""

from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods, require_POST
from django.views.decorators.csrf import csrf_exempt
import json
from app.autenticacion.models import PerfilUsuario, Rol


def es_administrador(user):
    """Verifica si el usuario es administrador"""
    try:
        if user.is_superuser:
            return True
        return user.perfil.rol.nombre == 'administrador'
    except:
        return False


# ==================== VISTAS TRADICIONALES ====================

@login_required(login_url='autenticacion:login')
@user_passes_test(es_administrador)
def usuarios_view(request):
    """Vista principal de gestión de usuarios"""
    context = {
        'titulo': 'Gestión de Usuarios'
    }
    return render(request, 'usuarios/usuarios.html', context)


# ==================== API ENDPOINTS ====================

@login_required(login_url='autenticacion:login')
@user_passes_test(es_administrador)
@require_http_methods(["GET"])
def api_usuarios_lista(request):
    """API: Obtener lista de usuarios en formato JSON"""
    usuarios = User.objects.select_related('perfil__rol').exclude(
        perfil__rol__nombre='cliente'
    ).values(
        'id', 'username', 'email', 'first_name', 'last_name', 
        'is_active', 'perfil__rol__nombre'
    )
    
    usuarios_list = []
    for usuario in usuarios:
        usuarios_list.append({
            'id': usuario['id'],
            'username': usuario['username'],
            'email': usuario['email'],
            'first_name': usuario['first_name'],
            'last_name': usuario['last_name'],
            'is_active': usuario['is_active'],
            'rol': usuario.get('perfil__rol__nombre', ''),
            'email_verified': True  # En un proyecto real, esto vendría del modelo
        })
    
    return JsonResponse({
        'success': True,
        'usuarios': usuarios_list
    })


@login_required(login_url='autenticacion:login')
@user_passes_test(es_administrador)
@require_http_methods(["GET"])
def api_usuario_detalle(request, usuario_id):
    """API: Obtener detalles de un usuario específico"""
    try:
        usuario = User.objects.select_related('perfil__rol').get(pk=usuario_id)
        if hasattr(usuario, 'perfil') and usuario.perfil.rol.nombre == 'cliente':
            return JsonResponse({'success': False, 'error': 'No se puede ver clientes en gestion de usuarios'}, status=403)
        
        return JsonResponse({
            'success': True,
            'usuario': {
                'id': usuario.id,
                'username': usuario.username,
                'email': usuario.email,
                'first_name': usuario.first_name,
                'last_name': usuario.last_name,
                'is_active': usuario.is_active,
                'rol': usuario.perfil.rol.nombre if hasattr(usuario, 'perfil') else '',
                'date_joined': usuario.date_joined.isoformat(),
                'last_login': usuario.last_login.isoformat() if usuario.last_login else None
            }
        })
    except User.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Usuario no encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@login_required(login_url='autenticacion:login')
@user_passes_test(es_administrador)
@require_http_methods(["POST"])
def api_usuario_crear(request):
    """API: Crear nuevo usuario"""
    try:
        datos = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'JSON inválido'}, status=400)
    
    # Validaciones
    username = datos.get('username', '').strip()
    email = datos.get('email', '').strip()
    password = datos.get('password', '')
    first_name = datos.get('first_name', '').strip()
    last_name = datos.get('last_name', '').strip()
    rol = datos.get('rol', '')
    
    if not username:
        return JsonResponse({'success': False, 'error': 'Usuario es requerido'})
    
    if not email:
        return JsonResponse({'success': False, 'error': 'Correo es requerido'})
    
    if not password or len(password) < 6:
        return JsonResponse({'success': False, 'error': 'Contraseña debe tener al menos 6 caracteres'})
    
    if not rol:
        return JsonResponse({'success': False, 'error': 'Debe seleccionar un rol'})

    if rol == 'cliente':
        return JsonResponse({'success': False, 'error': 'No se puede crear clientes en gestion de usuarios'})
    
    # Verificar usuario duplicado
    if User.objects.filter(username=username).exists():
        return JsonResponse({'success': False, 'error': 'Usuario ya existe'})
    
    # Verificar email duplicado
    if User.objects.filter(email=email).exists():
        return JsonResponse({'success': False, 'error': 'Correo ya existe'})
    
    try:
        # Crear usuario
        usuario = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Asignar rol (obligatorio)
        try:
            rol_obj = Rol.objects.get(nombre=rol)
            PerfilUsuario.objects.create(usuario=usuario, rol=rol_obj)
        except Rol.DoesNotExist:
            usuario.delete()  # Eliminar usuario si el rol no existe
            return JsonResponse({'success': False, 'error': f'El rol "{rol}" no existe en el sistema'})
        
        return JsonResponse({
            'success': True,
            'message': f'Usuario {username} creado exitosamente con rol {rol}',
            'usuario': {
                'id': usuario.id,
                'username': usuario.username,
                'email': usuario.email,
                'first_name': usuario.first_name,
                'last_name': usuario.last_name
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


@login_required(login_url='autenticacion:login')
@user_passes_test(es_administrador)
@require_http_methods(["PUT", "POST"])
def api_usuario_actualizar(request, usuario_id):
    """API: Actualizar usuario existente"""
    usuario = get_object_or_404(User, pk=usuario_id)

    if hasattr(usuario, 'perfil') and usuario.perfil.rol.nombre == 'cliente':
        return JsonResponse({'success': False, 'error': 'No se puede editar clientes en gestion de usuarios'}, status=403)
    
    try:
        datos = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'JSON inválido'}, status=400)
    
    try:
        # Actualizar campos permitidos
        if 'email' in datos:
            email = datos['email'].strip()
            if email != usuario.email and User.objects.filter(email=email).exists():
                return JsonResponse({'success': False, 'error': 'Correo ya está en uso'})
            usuario.email = email
        
        if 'first_name' in datos:
            usuario.first_name = datos['first_name'].strip()
        
        if 'last_name' in datos:
            usuario.last_name = datos['last_name'].strip()
        
        if 'is_active' in datos:
            usuario.is_active = bool(datos['is_active'])
        
        # Cambiar contraseña si se proporciona
        if 'password' in datos and datos['password']:
            password = datos['password']
            if len(password) < 6:
                return JsonResponse({'success': False, 'error': 'La contraseña debe tener al menos 6 caracteres'})
            usuario.set_password(password)
        
        usuario.save()
        
        # Actualizar rol (obligatorio)
        if 'rol' in datos and datos['rol']:
            if datos['rol'] == 'cliente':
                return JsonResponse({'success': False, 'error': 'No se puede asignar rol cliente en gestion de usuarios'})
            try:
                rol_obj = Rol.objects.get(nombre=datos['rol'])
                try:
                    perfil = usuario.perfil
                    perfil.rol = rol_obj
                    perfil.save()
                except PerfilUsuario.DoesNotExist:
                    PerfilUsuario.objects.create(usuario=usuario, rol=rol_obj)
            except Rol.DoesNotExist:
                return JsonResponse({'success': False, 'error': f'El rol "{datos["rol"]}" no existe en el sistema'})
        
        return JsonResponse({
            'success': True,
            'message': 'Usuario actualizado exitosamente'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


@login_required(login_url='autenticacion:login')
@user_passes_test(es_administrador)
@require_http_methods(["DELETE", "POST"])
def api_usuario_eliminar(request, usuario_id):
    """API: Eliminar usuario"""
    usuario = get_object_or_404(User, pk=usuario_id)

    if hasattr(usuario, 'perfil') and usuario.perfil.rol.nombre == 'cliente':
        return JsonResponse({'success': False, 'error': 'No se puede eliminar clientes en gestion de usuarios'}, status=403)
    
    # Evitar eliminación de uno mismo
    if usuario.id == request.user.id:
        return JsonResponse({'success': False, 'error': 'No puedes eliminar tu propia cuenta'})
    
    try:
        username = usuario.username
        usuario.delete()
        
        return JsonResponse({
            'success': True,
            'message': f'Usuario {username} eliminado exitosamente'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})
