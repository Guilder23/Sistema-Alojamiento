from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.http import JsonResponse
from django.views.generic import CreateView
from django.urls import reverse_lazy
from .models import PerfilUsuario, Rol
from django.contrib.auth.models import User
import json


# ==================== FORMULARIO PERSONALIZADO ====================

class FormularioLoginPersonalizado(AuthenticationForm):
    """Formulario que permite login con usuario o email"""
    
    def clean(self):
        username = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')
        
        if username is not None and password:
            # Intentar autenticar con el usuario/email proporcionado
            self.user_cache = authenticate(
                self.request,
                username=username,
                password=password,
            )
            
            # Si falla, intentar buscar por email
            if self.user_cache is None:
                try:
                    user = User.objects.get(email=username)
                    self.user_cache = authenticate(
                        self.request,
                        username=user.username,
                        password=password,
                    )
                except User.DoesNotExist:
                    pass
            
            # Si aún falla, mostrar error
            if self.user_cache is None:
                raise self.get_invalid_login_error()
        
        return self.cleaned_data


# ==================== AUTENTICACIÓN ====================

class LoginPersonalizado(LoginView):
    """Vista de login personalizada que redirecciona según el rol"""
    template_name = 'inicio/inicio.html'
    form_class = FormularioLoginPersonalizado
    
    def get_context_data(self, **kwargs):
        """Añadir contexto adicional"""
        context = super().get_context_data(**kwargs)
        context['titulo'] = '🔐 Login'
        context['descripcion'] = 'Ingresa tu usuario, email y contraseña para acceder'
        context['abrir_modal_login'] = True
        return context
    
    def form_valid(self, form):
        """Después del login exitoso, redirigir según el rol"""
        response = super().form_valid(form)
        user = self.request.user
        
        if user.is_superuser:
            rol = 'administrador'
        else:
            try:
                rol = user.perfil.rol.nombre
            except Exception:
                rol = 'cliente'
        
        # Guardar el rol en la sesión
        self.request.session['user_rol'] = rol
        
        # Redirigir según el rol
        if rol == 'administrador':
            return redirect('autenticacion:dashboard_admin')
        elif rol == 'recepcionista':
            return redirect('autenticacion:dashboard_recepcionista')
        elif rol == 'gerente':
            return redirect('autenticacion:dashboard_gerente')
        elif rol == 'empleado':
            return redirect('autenticacion:dashboard_limpieza')
        else:
            return redirect('autenticacion:dashboard_cliente')


def logout_view(request):
    """Vista de logout personalizada que acepta GET y POST"""
    logout(request)
    return redirect('inicio:inicio')


def registro(request):
    """Vista para registro de nuevos usuarios (clientes)"""
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        email = request.POST.get('email', '').strip()
        # Compatibilidad con nombres usados en el modal (password1/password2)
        password = request.POST.get('password', request.POST.get('password1', ''))
        password_confirm = request.POST.get('password_confirm', request.POST.get('password2', ''))
        first_name = request.POST.get('first_name', '').strip()
        last_name = request.POST.get('last_name', '').strip()
        
        # Validaciones
        errores = []
        
        if not username or len(username) < 3:
            errores.append('El usuario debe tener al menos 3 caracteres')
        
        if User.objects.filter(username=username).exists():
            errores.append('Este usuario ya existe')
        
        if not email or '@' not in email:
            errores.append('Email inválido')
        
        if User.objects.filter(email=email).exists():
            errores.append('Este correo ya está registrado')
        
        if not password or len(password) < 8:
            errores.append('La contraseña debe tener al menos 8 caracteres')
        
        if password != password_confirm:
            errores.append('Las contraseñas no coinciden')
        
        if errores:
            for error in errores:
                messages.error(request, error)
            return render(request, 'inicio/inicio.html', {
                'abrir_modal_registro': True,
            })
        else:
            # Crear usuario
            usuario = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            
            # Asignar rol de cliente
            try:
                rol_cliente = Rol.objects.get(nombre='cliente')
                PerfilUsuario.objects.create(usuario=usuario, rol=rol_cliente)
            except Rol.DoesNotExist:
                pass
            
            messages.success(request, '¡Registro exitoso! Inicia sesión con tus credenciales')
            return redirect('autenticacion:login')

    return render(request, 'inicio/inicio.html', {
        'abrir_modal_registro': True,
    })


# ==================== DASHBOARDS ====================

@login_required(login_url='autenticacion:login')
def dashboard_admin(request):
    """Dashboard para administradores"""
    context = {
        'titulo': 'Panel Administrativo',
        'total_usuarios': User.objects.count(),
    }
    return render(request, 'autenticacion/dashboards/admin.html', context)


@login_required(login_url='autenticacion:login')
def dashboard_recepcionista(request):
    """Dashboard para recepcionistas"""
    context = {
        'titulo': 'Panel de Recepcionista',
    }
    return render(request, 'autenticacion/dashboards/recepcionista.html', context)


@login_required(login_url='autenticacion:login')
def dashboard_gerente(request):
    """Dashboard para gerentes"""
    context = {
        'titulo': 'Panel de Gerente',
    }
    return render(request, 'autenticacion/dashboards/gerente.html', context)


@login_required(login_url='autenticacion:login')
def dashboard_limpieza(request):
    """Dashboard para empleados de limpieza"""
    context = {
        'titulo': 'Panel de Limpieza',
    }
    return render(request, 'autenticacion/dashboards/limpieza.html', context)


@login_required(login_url='autenticacion:login')
def dashboard_cliente(request):
    """Dashboard para clientes"""
    context = {
        'titulo': 'Panel del Cliente',
    }
    return render(request, 'autenticacion/dashboards/cliente.html', context)


# ==================== GESTIÓN DE USUARIOS (API) ====================

@login_required(login_url='autenticacion:login')
def usuarios_list(request):
    """Vista principal para la gestión de usuarios"""
    usuarios = User.objects.all().select_related('perfilusuario')
    context = {
        'usuarios': usuarios,
        'titulo': 'Gestión de Usuarios'
    }
    return render(request, 'usuarios/usuarios.html', context)


@login_required(login_url='autenticacion:login')
def usuarios_api(request):
    """API para obtener usuarios en formato JSON"""
    usuarios = User.objects.all().select_related('perfilusuario')
    
    usuarios_data = []
    for usuario in usuarios:
        try:
            rol = usuario.perfilusuario.rol.nombre if usuario.perfilusuario else 'cliente'
        except:
            rol = 'cliente'
        
        usuarios_data.append({
            'id': usuario.id,
            'username': usuario.username,
            'email': usuario.email,
            'nombre_completo': f"{usuario.first_name} {usuario.last_name}".strip() or usuario.username,
            'rol': rol,
            'estado': 'activo' if usuario.is_active else 'inactivo',
            'fecha_registro': usuario.date_joined.strftime('%Y-%m-%d'),
            'is_staff': usuario.is_staff
        })
    
    return JsonResponse({'usuarios': usuarios_data})


@login_required(login_url='autenticacion:login')
def crear_usuario(request):
    """Crear un nuevo usuario"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Validar datos
            if not data.get('username') or not data.get('email') or not data.get('password'):
                return JsonResponse({'error': 'Campos requeridos faltantes'}, status=400)
            
            # Crear usuario
            usuario = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', '')
            )
            
            # Asignar rol si es necesario
            if data.get('rol'):
                try:
                    rol = Rol.objects.get(nombre=data['rol'])
                    PerfilUsuario.objects.update_or_create(
                        usuario=usuario,
                        defaults={'rol': rol}
                    )
                except Rol.DoesNotExist:
                    pass
            
            return JsonResponse({
                'success': True,
                'message': f'Usuario {usuario.username} creado exitosamente',
                'usuario': {
                    'id': usuario.id,
                    'username': usuario.username,
                    'email': usuario.email
                }
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)


@login_required(login_url='autenticacion:login')
def editar_usuario(request, usuario_id):
    """Editar un usuario existente"""
    try:
        usuario = User.objects.get(id=usuario_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            usuario.email = data.get('email', usuario.email)
            usuario.first_name = data.get('first_name', usuario.first_name)
            usuario.last_name = data.get('last_name', usuario.last_name)
            
            if data.get('password'):
                usuario.set_password(data['password'])
            
            usuario.save()
            
            # Actualizar rol si es necesario
            if data.get('rol'):
                try:
                    rol = Rol.objects.get(nombre=data['rol'])
                    PerfilUsuario.objects.update_or_create(
                        usuario=usuario,
                        defaults={'rol': rol}
                    )
                except Rol.DoesNotExist:
                    pass
            
            return JsonResponse({
                'success': True,
                'message': f'Usuario {usuario.username} actualizado exitosamente'
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)


@login_required(login_url='autenticacion:login')
def eliminar_usuario(request, usuario_id):
    """Eliminar un usuario"""
    try:
        usuario = User.objects.get(id=usuario_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
    
    if request.method == 'DELETE':
        username = usuario.username
        usuario.delete()
        return JsonResponse({
            'success': True,
            'message': f'Usuario {username} eliminado exitosamente'
        })
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)
