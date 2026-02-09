import json

from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.http import require_http_methods

from app.autenticacion.models import PerfilUsuario, Rol
from .models import FotoHabitacion, Habitacion


def es_administrador(user):
    try:
        return user.perfil.rol.nombre == 'administrador'
    except Exception:
        return False


@login_required(login_url='autenticacion:login')
@user_passes_test(es_administrador)
def habitaciones_view(request):
    context = {
        'titulo': 'Gestión de Habitaciones',
        'tipos_habitacion': Habitacion.TIPOS_HABITACION,
        'estados_habitacion': Habitacion.ESTADOS_HABITACION,
        'tipos_bano': Habitacion.TIPOS_BANO,
    }
    return render(request, 'habitaciones/habitaciones.html', context)


@login_required(login_url='autenticacion:login')
def buscar_habitaciones_view(request):
    """Vista para que los clientes puedan buscar y reservar habitaciones disponibles"""
    habitaciones = Habitacion.objects.filter(estado='disponible').prefetch_related('fotos').order_by('numero')
    
    context = {
        'titulo': 'Buscar Habitaciones',
        'habitaciones': habitaciones,
        'tipos_habitacion': Habitacion.TIPOS_HABITACION,
        'tipos_bano': Habitacion.TIPOS_BANO,
        'tipos_cama': Habitacion.TIPOS_CAMA,
        'vistas': Habitacion.VISTAS,
    }
    return render(request, 'reservas/reservasClientes/buscar.html', context)


def _habitacion_to_dict(h):
    return {
        'id': h.id,
        'numero': h.numero,
        'nombre': h.nombre,
        'tipo': h.tipo,
        'capacidad': h.capacidad,
        'precio_noche': str(h.precio_noche),
        'precio_fin_semana': str(h.precio_fin_semana) if h.precio_fin_semana is not None else '',
        'estado': h.estado,
        'piso': h.piso,
        'descripcion': h.descripcion or '',
        'foto': h.foto.url if h.foto else None,
        'tipo_bano': h.tipo_bano,
        'bano_privado': bool(h.bano_privado),
        'tv': bool(h.tv),
        'internet': bool(h.internet),
        'acceso_youtube': bool(h.acceso_youtube),
        'aire_acondicionado': bool(h.aire_acondicionado),
        'calefaccion': bool(h.calefaccion),
        'minibar': bool(h.minibar),
        'caja_fuerte': bool(h.caja_fuerte),
        'escritorio': bool(h.escritorio),
        'armario': bool(h.armario),
        'agua_caliente': bool(h.agua_caliente),
        'toallas': bool(h.toallas),
        'papel_higienico': bool(h.papel_higienico),
        'shampoo': bool(h.shampoo),
        'secador_cabello': bool(h.secador_cabello),
        'vista': h.vista or '',
        'youtube_url': h.youtube_url or '',
        'numero_camas': h.numero_camas,
        'tipo_cama': h.tipo_cama,
        'reserva_min_noches': h.reserva_min_noches,
        'reserva_max_noches': h.reserva_max_noches,
        'permite_mascotas': bool(h.permite_mascotas),
        'permite_fumar': bool(h.permite_fumar),
        'fotos': [
            {
                'id': f.id,
                'url': f.foto.url,
                'descripcion': f.descripcion or '',
                'creado': f.creado.isoformat() if f.creado else None,
            }
            for f in h.fotos.all()
        ],
        'creado': h.creado.isoformat() if h.creado else None,
        'actualizado': h.actualizado.isoformat() if h.actualizado else None,
    }


@login_required(login_url='autenticacion:login')
@user_passes_test(es_administrador)
@require_http_methods(["GET"])
def api_habitaciones_lista(request):
    habitaciones = Habitacion.objects.all().order_by('numero')
    habitaciones_list = []
    for h in habitaciones:
        habitaciones_list.append(_habitacion_to_dict(h))

    return JsonResponse({'success': True, 'habitaciones': habitaciones_list})


@login_required(login_url='autenticacion:login')
@user_passes_test(es_administrador)
@require_http_methods(["GET"])
def api_habitacion_detalle(request, habitacion_id):
    h = get_object_or_404(Habitacion.objects.prefetch_related('fotos'), pk=habitacion_id)
    return JsonResponse({'success': True, 'habitacion': _habitacion_to_dict(h)})


@login_required(login_url='autenticacion:login')
@require_http_methods(["GET"])
def api_habitacion_detalle_publico(request, habitacion_id):
    """
    Endpoint público para que los clientes vean detalles de habitaciones disponibles.
    No requiere permisos de administrador.
    """
    h = get_object_or_404(
        Habitacion.objects.prefetch_related('fotos'), 
        pk=habitacion_id,
        estado='disponible'  # Solo habitaciones disponibles
    )
    return JsonResponse({'success': True, 'habitacion': _habitacion_to_dict(h)})


def _parse_json_body(request):
    try:
        return json.loads(request.body or '{}'), None
    except json.JSONDecodeError:
        return None, JsonResponse({'success': False, 'error': 'JSON inválido'}, status=400)


def _get_request_data(request):
    content_type = (request.content_type or '').lower()
    if content_type.startswith('multipart/form-data') or content_type.startswith('application/x-www-form-urlencoded'):
        # Usar .dict() para convertir QueryDict a dict normal con strings (no listas)
        return request.POST.dict(), None
    return _parse_json_body(request)


def _parse_bool(value):
    if value is True or value is False:
        return bool(value)
    if value is None:
        return False
    s = str(value).strip().lower()
    return s in {'1', 'true', 'on', 'yes', 'si', 'sí'}


def _validar_campos_habitacion(datos, habitacion_actual=None):
    # Si estamos editando, usar el número de la habitación actual (no se puede modificar)
    if habitacion_actual is not None:
        numero = habitacion_actual.numero
    else:
        numero = (datos.get('numero') or '').strip()
    nombre = (datos.get('nombre') or '').strip()
    tipo = datos.get('tipo')
    estado = datos.get('estado')
    descripcion = (datos.get('descripcion') or '').strip()
    vista = (datos.get('vista') or '').strip()
    youtube_url = (datos.get('youtube_url') or '').strip()
    tipo_bano = datos.get('tipo_bano') or 'privado'

    bano_privado = _parse_bool(datos.get('bano_privado'))

    try:
        numero_camas = int(datos.get('numero_camas'))
    except Exception:
        numero_camas = None

    tipo_cama = datos.get('tipo_cama') or 'single'

    try:
        reserva_min_noches = int(datos.get('reserva_min_noches'))
    except Exception:
        reserva_min_noches = None

    try:
        reserva_max_noches = int(datos.get('reserva_max_noches'))
    except Exception:
        reserva_max_noches = None

    permite_mascotas = _parse_bool(datos.get('permite_mascotas'))
    permite_fumar = _parse_bool(datos.get('permite_fumar'))

    precio_fin_semana_raw = (datos.get('precio_fin_semana') or '').strip()
    if precio_fin_semana_raw == '':
        precio_fin_semana = None
    else:
        try:
            precio_fin_semana = float(precio_fin_semana_raw)
        except Exception:
            precio_fin_semana = None

    try:
        capacidad = int(datos.get('capacidad'))
    except Exception:
        capacidad = None

    try:
        piso = int(datos.get('piso'))
    except Exception:
        piso = None

    try:
        precio_noche = float(datos.get('precio_noche'))
    except Exception:
        precio_noche = None

    if not numero:
        return None, 'El número de habitación es requerido'

    if not nombre:
        return None, 'El nombre de habitación es requerido'

    qs = Habitacion.objects.filter(numero=numero)
    if habitacion_actual is not None:
        qs = qs.exclude(pk=habitacion_actual.pk)
    if qs.exists():
        return None, 'Ya existe una habitación con ese número'

    tipos_validos = {t[0] for t in Habitacion.TIPOS_HABITACION}
    if tipo not in tipos_validos:
        return None, 'Tipo de habitación inválido'

    estados_validos = {e[0] for e in Habitacion.ESTADOS_HABITACION}
    if estado not in estados_validos:
        return None, 'Estado de habitación inválido'

    if capacidad is None or capacidad < 1:
        return None, 'Capacidad inválida'

    if piso is None or piso < 1:
        return None, 'Piso inválido'

    if precio_noche is None or precio_noche < 0:
        return None, 'Precio por noche inválido'

    banos_validos = {b[0] for b in Habitacion.TIPOS_BANO}
    if tipo_bano not in banos_validos:
        return None, 'Tipo de baño inválido'

    vistas_validas = {v[0] for v in Habitacion.VISTAS}
    if vista and vista not in vistas_validas:
        return None, 'Vista inválida'

    tipos_cama_validos = {t[0] for t in Habitacion.TIPOS_CAMA}
    if tipo_cama not in tipos_cama_validos:
        return None, 'Tipo de cama inválido'

    if numero_camas is None or numero_camas < 1:
        return None, 'Número de camas inválido'

    if reserva_min_noches is None or reserva_min_noches < 1:
        return None, 'Reserva mínima inválida'

    if reserva_max_noches is None or reserva_max_noches < 1:
        return None, 'Reserva máxima inválida'

    if reserva_min_noches is not None and reserva_max_noches is not None and reserva_min_noches > reserva_max_noches:
        return None, 'La reserva mínima no puede ser mayor a la máxima'

    if precio_fin_semana is not None and precio_fin_semana < 0:
        return None, 'Precio fin de semana inválido'

    if youtube_url and not (youtube_url.startswith('http://') or youtube_url.startswith('https://')):
        return None, 'El enlace de YouTube debe ser una URL válida'

    return {
        'numero': numero,
        'nombre': nombre,
        'tipo': tipo,
        'capacidad': capacidad,
        'precio_noche': precio_noche,
        'precio_fin_semana': precio_fin_semana,
        'estado': estado,
        'piso': piso,
        'descripcion': descripcion,
        'tipo_bano': tipo_bano,
        'bano_privado': bano_privado,
        'tv': _parse_bool(datos.get('tv')),
        'internet': _parse_bool(datos.get('internet')),
        'acceso_youtube': _parse_bool(datos.get('acceso_youtube')),
        'aire_acondicionado': _parse_bool(datos.get('aire_acondicionado')),
        'calefaccion': _parse_bool(datos.get('calefaccion')),
        'minibar': _parse_bool(datos.get('minibar')),
        'caja_fuerte': _parse_bool(datos.get('caja_fuerte')),
        'escritorio': _parse_bool(datos.get('escritorio')),
        'armario': _parse_bool(datos.get('armario')),
        'agua_caliente': _parse_bool(datos.get('agua_caliente')),
        'toallas': _parse_bool(datos.get('toallas')),
        'papel_higienico': _parse_bool(datos.get('papel_higienico')),
        'shampoo': _parse_bool(datos.get('shampoo')),
        'secador_cabello': _parse_bool(datos.get('secador_cabello')),
        'vista': vista or 'sin_vista',
        'youtube_url': youtube_url,
        'numero_camas': numero_camas,
        'tipo_cama': tipo_cama,
        'reserva_min_noches': reserva_min_noches,
        'reserva_max_noches': reserva_max_noches,
        'permite_mascotas': permite_mascotas,
        'permite_fumar': permite_fumar,
    }, None


def _guardar_galeria_fotos(request, habitacion):
    nuevas = request.FILES.getlist('fotos')
    if not nuevas:
        return None

    existentes = habitacion.fotos.count()
    total = existentes + len(nuevas)
    if total > 6:
        return f'Solo se permiten hasta 6 imágenes. Actualmente: {existentes}, intentando subir: {len(nuevas)}'

    for f in nuevas:
        FotoHabitacion.objects.create(habitacion=habitacion, foto=f)
    return None


@login_required(login_url='autenticacion:login')
@user_passes_test(es_administrador)
@require_http_methods(["POST"])
def api_habitacion_crear(request):
    try:
        datos, error_resp = _get_request_data(request)
        if error_resp:
            return error_resp

        campos, error = _validar_campos_habitacion(datos)
        if error:
            return JsonResponse({'success': False, 'error': error}, status=400)

        h = Habitacion.objects.create(**campos)
        if request.FILES.get('foto'):
            h.foto = request.FILES['foto']
            h.save(update_fields=['foto'])

        error_galeria = _guardar_galeria_fotos(request, h)
        if error_galeria:
            h.delete()
            return JsonResponse({'success': False, 'error': error_galeria}, status=400)

        return JsonResponse({
            'success': True,
            'message': 'Habitación creada exitosamente',
            'habitacion': _habitacion_to_dict(Habitacion.objects.prefetch_related('fotos').get(pk=h.pk))
        })
    except Exception as e:
        import traceback
        return JsonResponse({
            'success': False, 
            'error': f'Error al crear habitación: {str(e)}',
            'traceback': traceback.format_exc()
        }, status=500)


@login_required(login_url='autenticacion:login')
@user_passes_test(es_administrador)
@require_http_methods(["PUT", "POST"])
def api_habitacion_actualizar(request, habitacion_id):
    h = get_object_or_404(Habitacion.objects.prefetch_related('fotos'), pk=habitacion_id)
    datos, error_resp = _get_request_data(request)
    if error_resp:
        return error_resp

    campos, error = _validar_campos_habitacion(datos, habitacion_actual=h)
    if error:
        return JsonResponse({'success': False, 'error': error}, status=400)

    for k, v in campos.items():
        setattr(h, k, v)

    if request.FILES.get('foto'):
        h.foto = request.FILES['foto']
    h.save()

    error_galeria = _guardar_galeria_fotos(request, h)
    if error_galeria:
        return JsonResponse({'success': False, 'error': error_galeria}, status=400)

    return JsonResponse({'success': True, 'message': 'Habitación actualizada exitosamente'})


@login_required(login_url='autenticacion:login')
@user_passes_test(es_administrador)
@require_http_methods(["DELETE", "POST"])
def api_habitacion_eliminar(request, habitacion_id):
    h = get_object_or_404(Habitacion, pk=habitacion_id)
    numero = h.numero
    h.delete()
    return JsonResponse({'success': True, 'message': f'Habitación {numero} eliminada exitosamente'})
