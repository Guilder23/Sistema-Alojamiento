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
    usuarios = User.objects.all().select_related('perfil__rol').values(
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
    
    if not password or len(password) < 8:
        return JsonResponse({'success': False, 'error': 'Contraseña debe tener al menos 8 caracteres'})
    
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
        
        # Asignar rol
        if rol:
            try:
                rol_obj = Rol.objects.get(nombre=rol)
                PerfilUsuario.objects.create(usuario=usuario, rol=rol_obj)
            except Rol.DoesNotExist:
                pass
        
        return JsonResponse({
            'success': True,
            'message': f'Usuario {username} creado exitosamente',
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
@require_http_methods(["POST"])
def api_usuario_actualizar(request, usuario_id):
    """API: Actualizar usuario existente"""
    usuario = get_object_or_404(User, pk=usuario_id)
    
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
        
        usuario.save()
        
        # Actualizar rol
        if 'rol' in datos and datos['rol']:
            try:
                rol_obj = Rol.objects.get(nombre=datos['rol'])
                try:
                    perfil = usuario.perfil
                    perfil.rol = rol_obj
                    perfil.save()
                except PerfilUsuario.DoesNotExist:
                    PerfilUsuario.objects.create(usuario=usuario, rol=rol_obj)
            except Rol.DoesNotExist:
                pass
        
        return JsonResponse({
            'success': True,
            'message': 'Usuario actualizado exitosamente'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


@login_required(login_url='autenticacion:login')
@user_passes_test(es_administrador)
@require_http_methods(["POST"])
def api_usuario_eliminar(request, usuario_id):
    """API: Eliminar usuario"""
    usuario = get_object_or_404(User, pk=usuario_id)
    
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
