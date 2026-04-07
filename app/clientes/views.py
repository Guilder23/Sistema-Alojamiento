"""
Vistas para la gestion de clientes.
Incluye vistas tradicionales y API endpoints para AJAX.
"""

import json

from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.models import User
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.http import require_http_methods

from app.autenticacion.models import PerfilUsuario, Rol
from .models import Cliente


def puede_gestionar_clientes(user):
	"""Permite acceso a admin, recepcionista y gerente."""
	try:
		return user.perfil.rol.nombre in {'administrador', 'recepcionista', 'gerente'}
	except Exception:
		return False


@login_required(login_url='autenticacion:login')
@user_passes_test(puede_gestionar_clientes)
def clientes_view(request):
	"""Vista principal de gestion de clientes"""
	context = {
		'titulo': 'Gestion de Clientes'
	}
	return render(request, 'clientes/clientes.html', context)


@login_required(login_url='autenticacion:login')
@user_passes_test(puede_gestionar_clientes)
@require_http_methods(["GET"])
def api_clientes_lista(request):
	"""API: Obtener lista de clientes"""
	clientes = Cliente.objects.all().order_by('apellido', 'nombre')
	clientes_list = []

	for cliente in clientes:
		clientes_list.append({
			'id': cliente.id,
			'nombre': cliente.nombre,
			'apellido': cliente.apellido,
			'nombre_completo': cliente.nombre_completo,
			'tipo_documento': cliente.tipo_documento,
			'tipo_documento_label': cliente.get_tipo_documento_display(),
			'numero_documento': cliente.numero_documento,
			'telefono': cliente.telefono,
			'email': cliente.email,
			'pais': cliente.pais,
			'pais_label': cliente.get_pais_display(),
			'activo': cliente.activo,
		})

	return JsonResponse({
		'success': True,
		'clientes': clientes_list
	})


@login_required(login_url='autenticacion:login')
@user_passes_test(puede_gestionar_clientes)
@require_http_methods(["GET"])
def api_cliente_detalle(request, cliente_id):
	"""API: Obtener detalles de un cliente"""
	cliente = get_object_or_404(Cliente, pk=cliente_id)

	return JsonResponse({
		'success': True,
		'cliente': {
			'id': cliente.id,
			'nombre': cliente.nombre,
			'apellido': cliente.apellido,
			'nombre_completo': cliente.nombre_completo,
			'tipo_documento': cliente.tipo_documento,
			'tipo_documento_label': cliente.get_tipo_documento_display(),
			'numero_documento': cliente.numero_documento,
			'telefono': cliente.telefono,
			'email': cliente.email,
			'pais': cliente.pais,
			'pais_label': cliente.get_pais_display(),
			'ciudad': cliente.ciudad,
			'direccion': cliente.direccion,
			'activo': cliente.activo,
			'creado': cliente.creado.isoformat() if cliente.creado else None,
			'actualizado': cliente.actualizado.isoformat() if cliente.actualizado else None,
		}
	})


@login_required(login_url='autenticacion:login')
@user_passes_test(puede_gestionar_clientes)
@require_http_methods(["POST"])
def api_cliente_crear(request):
	"""API: Crear cliente y cuenta de usuario"""
	try:
		datos = json.loads(request.body)
	except json.JSONDecodeError:
		return JsonResponse({'success': False, 'error': 'JSON invalido'}, status=400)

	nombre = datos.get('nombre', '').strip()
	apellido = datos.get('apellido', '').strip()
	username = datos.get('username', '').strip()
	email = datos.get('email', '').strip()
	password = datos.get('password', '')
	password_confirm = datos.get('password_confirm', '')
	tipo_documento = datos.get('tipo_documento', '').strip()
	numero_documento = datos.get('numero_documento', '').strip()
	telefono = datos.get('telefono', '').strip()
	pais = datos.get('pais', '').strip()
	ciudad = datos.get('ciudad', '').strip() or None
	direccion = datos.get('direccion', '').strip() or None
	activo = bool(datos.get('activo', True))

	if not nombre:
		return JsonResponse({'success': False, 'error': 'Nombre es requerido'})
	if not apellido:
		return JsonResponse({'success': False, 'error': 'Apellido es requerido'})
	if not username:
		return JsonResponse({'success': False, 'error': 'Usuario es requerido'})
	if not email:
		return JsonResponse({'success': False, 'error': 'Email es requerido'})
	if not password or len(password) < 6:
		return JsonResponse({'success': False, 'error': 'Contrasena debe tener al menos 6 caracteres'})
	if password_confirm and password_confirm != password:
		return JsonResponse({'success': False, 'error': 'Las contrasenas no coinciden'})
	if not tipo_documento:
		return JsonResponse({'success': False, 'error': 'Tipo de documento es requerido'})
	if not numero_documento:
		return JsonResponse({'success': False, 'error': 'Numero de documento es requerido'})
	if not telefono:
		return JsonResponse({'success': False, 'error': 'Telefono es requerido'})
	if not pais:
		return JsonResponse({'success': False, 'error': 'Pais es requerido'})

	tipos_validos = {key for key, _ in Cliente.TIPOS_DOCUMENTO}
	if tipo_documento not in tipos_validos:
		return JsonResponse({'success': False, 'error': 'Tipo de documento no valido'})

	paises_validos = {key for key, _ in Cliente.PAISES}
	if pais not in paises_validos:
		return JsonResponse({'success': False, 'error': 'Pais no valido'})

	if Cliente.objects.filter(numero_documento=numero_documento).exists():
		return JsonResponse({'success': False, 'error': 'Numero de documento ya existe'})

	if Cliente.objects.filter(email=email).exists():
		return JsonResponse({'success': False, 'error': 'Email ya existe'})

	if User.objects.filter(username=username).exists():
		return JsonResponse({'success': False, 'error': 'Usuario ya existe'})

	if User.objects.filter(email=email).exists():
		return JsonResponse({'success': False, 'error': 'Email ya existe en usuarios'})

	try:
		rol_cliente = Rol.objects.get(nombre='cliente')
	except Rol.DoesNotExist:
		return JsonResponse({'success': False, 'error': 'Rol cliente no existe en el sistema'})

	try:
		with transaction.atomic():
			usuario = User.objects.create_user(
				username=username,
				email=email,
				password=password,
				first_name=nombre,
				last_name=apellido
			)
			PerfilUsuario.objects.create(usuario=usuario, rol=rol_cliente)

			cliente = Cliente.objects.create(
				nombre=nombre,
				apellido=apellido,
				tipo_documento=tipo_documento,
				numero_documento=numero_documento,
				telefono=telefono,
				email=email,
				pais=pais,
				ciudad=ciudad,
				direccion=direccion,
				activo=activo,
			)
	except Exception as e:
		return JsonResponse({'success': False, 'error': str(e)})

	return JsonResponse({
		'success': True,
		'message': 'Cliente creado exitosamente',
		'cliente': {
			'id': cliente.id,
			'nombre': cliente.nombre,
			'apellido': cliente.apellido,
			'numero_documento': cliente.numero_documento,
			'email': cliente.email,
		}
	})


@login_required(login_url='autenticacion:login')
@user_passes_test(puede_gestionar_clientes)
@require_http_methods(["PUT", "POST"])
def api_cliente_actualizar(request, cliente_id):
	"""API: Actualizar cliente"""
	cliente = get_object_or_404(Cliente, pk=cliente_id)
	email_original = cliente.email

	try:
		datos = json.loads(request.body)
	except json.JSONDecodeError:
		return JsonResponse({'success': False, 'error': 'JSON invalido'}, status=400)

	if 'nombre' in datos:
		cliente.nombre = datos['nombre'].strip()

	if 'apellido' in datos:
		cliente.apellido = datos['apellido'].strip()

	if 'tipo_documento' in datos:
		tipo_documento = datos['tipo_documento'].strip()
		tipos_validos = {key for key, _ in Cliente.TIPOS_DOCUMENTO}
		if tipo_documento not in tipos_validos:
			return JsonResponse({'success': False, 'error': 'Tipo de documento no valido'})
		cliente.tipo_documento = tipo_documento

	if 'numero_documento' in datos:
		numero_documento = datos['numero_documento'].strip()
		if numero_documento != cliente.numero_documento and Cliente.objects.filter(numero_documento=numero_documento).exists():
			return JsonResponse({'success': False, 'error': 'Numero de documento ya existe'})
		cliente.numero_documento = numero_documento

	if 'telefono' in datos:
		cliente.telefono = datos['telefono'].strip()

	if 'email' in datos:
		email = datos['email'].strip()
		if email != cliente.email and Cliente.objects.filter(email=email).exclude(pk=cliente.pk).exists():
			return JsonResponse({'success': False, 'error': 'Email ya existe'})

		usuario_cliente = User.objects.filter(email=email_original, perfil__rol__nombre='cliente').first()
		if usuario_cliente and email != email_original:
			if User.objects.filter(email=email).exclude(pk=usuario_cliente.pk).exists():
				return JsonResponse({'success': False, 'error': 'Email ya existe en usuarios'})

		cliente.email = email

	if 'pais' in datos:
		pais = datos['pais'].strip()
		paises_validos = {key for key, _ in Cliente.PAISES}
		if pais not in paises_validos:
			return JsonResponse({'success': False, 'error': 'Pais no valido'})
		cliente.pais = pais

	if 'ciudad' in datos:
		cliente.ciudad = datos['ciudad'].strip() or None

	if 'direccion' in datos:
		cliente.direccion = datos['direccion'].strip() or None

	if 'activo' in datos:
		cliente.activo = bool(datos['activo'])

	try:
		cliente.save()

		if cliente.email != email_original:
			usuario_cliente = User.objects.filter(email=email_original, perfil__rol__nombre='cliente').first()
			if usuario_cliente:
				usuario_cliente.email = cliente.email
				if usuario_cliente.username == email_original:
					usuario_cliente.username = cliente.email
				usuario_cliente.save()
	except Exception as e:
		return JsonResponse({'success': False, 'error': str(e)})

	return JsonResponse({
		'success': True,
		'message': 'Cliente actualizado exitosamente'
	})


@login_required(login_url='autenticacion:login')
@user_passes_test(puede_gestionar_clientes)
@require_http_methods(["DELETE", "POST"])
def api_cliente_eliminar(request, cliente_id):
	"""API: Eliminar cliente"""
	cliente = get_object_or_404(Cliente, pk=cliente_id)
	email_cliente = cliente.email

	try:
		nombre = cliente.nombre_completo
		cliente.delete()

		usuario_cliente = User.objects.filter(email=email_cliente, perfil__rol__nombre='cliente').first()
		if usuario_cliente:
			usuario_cliente.delete()

		return JsonResponse({
			'success': True,
			'message': f'Cliente {nombre} eliminado exitosamente'
		})
	except Exception as e:
		return JsonResponse({'success': False, 'error': str(e)})
