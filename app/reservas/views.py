import json

from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from datetime import datetime
from decimal import Decimal

from app.habitaciones.models import Habitacion
from app.clientes.models import Cliente
from app.autenticacion.models import PerfilUsuario
from app.pagos.models import Pago

from .models import Reserva, AcompananteReserva


def es_staff_reservas(user):
    """Permite acceso a administrar reservas (admin, recepcionista y gerente)."""
    try:
        return user.perfil.rol.nombre in {'administrador', 'recepcionista', 'gerente'}
    except Exception:
        return False


def _obtener_o_crear_cliente(user):
    """
    Obtiene o crea un Cliente basado en el usuario autenticado.
    Busca primero por email, si no existe crea uno nuevo.
    """
    try:
        # Buscar cliente existente por email
        cliente = Cliente.objects.get(email=user.email)
        return cliente
    except Cliente.DoesNotExist:
        # Crear nuevo cliente con datos del usuario
        try:
            perfil = user.perfil
            telefono = perfil.telefono or perfil.celular or '0000000000'
            cedula = perfil.cedula or f'USR-{user.id}'
        except PerfilUsuario.DoesNotExist:
            telefono = '0000000000'
            cedula = f'USR-{user.id}'
        
        # Crear el cliente
        cliente = Cliente.objects.create(
            nombre=user.first_name or user.username,
            apellido=user.last_name or '',
            tipo_documento='ci',
            numero_documento=cedula,
            telefono=telefono,
            email=user.email,
            pais='VE',
            activo=True
        )
        return cliente


@login_required
@require_http_methods(["POST"])
def crear_reserva_api(request):
    """
    API para crear una nueva reserva.
    Espera: habitacion_id, fecha_inicio, fecha_fin, num_personas, observaciones
    """
    try:
        # Obtener datos del POST
        habitacion_id = request.POST.get('habitacion_id')
        fecha_inicio = request.POST.get('fecha_inicio')
        fecha_fin = request.POST.get('fecha_fin')
        num_personas = request.POST.get('num_personas')
        observaciones = request.POST.get('observaciones', '')
        
        # Validar que todos los campos requeridos estén presentes
        if not all([habitacion_id, fecha_inicio, fecha_fin, num_personas]):
            return JsonResponse({
                'success': False,
                'message': 'Faltan datos requeridos'
            }, status=400)
        
        # Obtener la habitación
        habitacion = get_object_or_404(Habitacion, id=habitacion_id, estado='disponible')
        
        # Convertir fechas de string a date
        try:
            fecha_entrada = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
            fecha_salida = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
        except ValueError:
            return JsonResponse({
                'success': False,
                'message': 'Formato de fecha inválido. Use YYYY-MM-DD'
            }, status=400)
        
        # Convertir número de personas a int
        try:
            num_huespedes = int(num_personas)
        except ValueError:
            return JsonResponse({
                'success': False,
                'message': 'Número de personas inválido'
            }, status=400)
        
        # Obtener o crear cliente
        cliente = _obtener_o_crear_cliente(request.user)
        
        # Calcular precio total
        num_noches = (fecha_salida - fecha_entrada).days
        if num_noches <= 0:
            return JsonResponse({
                'success': False,
                'message': 'La fecha de salida debe ser posterior a la fecha de entrada'
            }, status=400)
        
        precio_total = habitacion.precio_noche * num_noches
        
        # Crear la reserva dentro de una transacción
        with transaction.atomic():
            reserva = Reserva(
                habitacion=habitacion,
                cliente=cliente,
                creada_por=request.user,
                fecha_entrada=fecha_entrada,
                fecha_salida=fecha_salida,
                num_huespedes=num_huespedes,
                estado='pendiente',
                origen='online',
                precio_total=precio_total,
                notas=observaciones
            )
            
            # Validar y guardar (clean() se llama en save())
            try:
                reserva.save()
                
                # Actualizar el estado de la habitación a "ocupada"
                habitacion.estado = 'ocupada'
                habitacion.save()
                
            except ValidationError as e:
                return JsonResponse({
                    'success': False,
                    'message': str(e.message_dict if hasattr(e, 'message_dict') else e)
                }, status=400)
        
        return JsonResponse({
            'success': True,
            'message': 'Reserva creada exitosamente',
            'data': {
                'reserva_id': reserva.id,
                'estado': reserva.get_estado_display(),
                'precio_total': float(reserva.precio_total),
                'num_noches': num_noches
            }
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error al crear la reserva: {str(e)}'
        }, status=500)


@login_required
def mis_reservas(request):
    """
    Vista para mostrar las reservas del usuario autenticado.
    """
    try:
        # Obtener el cliente asociado al usuario
        cliente = Cliente.objects.get(email=request.user.email)
        
        # Obtener todas las reservas del cliente ordenadas por fecha
        reservas = Reserva.objects.filter(
            cliente=cliente
        ).select_related('habitacion').order_by('-fecha_entrada')
        
        context = {
            'reservas': reservas,
            'cliente': cliente
        }
        
        return render(request, 'reservas/reservasClientes/mis_reservas.html', context)
        
    except Cliente.DoesNotExist:
        # Si el cliente no existe, mostrar página vacía
        context = {
            'reservas': [],
            'cliente': None
        }
        return render(request, 'reservas/reservasClientes/mis_reservas.html', context)


@login_required
def todas_reservas(request):
    """
    Vista para que recepcionistas y administradores vean todas las reservas.
    """
    if not es_staff_reservas(request.user):
        return JsonResponse({'success': False, 'message': 'No tienes permisos para ver esta sección'}, status=403)

    # Obtener todas las reservas ordenadas por fecha
    reservas = Reserva.objects.select_related(
        'habitacion', 'cliente'
    ).prefetch_related('pagos').order_by('-fecha_entrada')

    # Adjuntar información de pago (último pago) sin romper templates existentes
    for r in reservas:
        try:
            p = r.pagos.all().first()
        except Exception:
            p = None

        r.pago_existe = bool(p)
        r.pago_estado = getattr(p, 'estado', None)
        r.pago_estado_validacion = getattr(p, 'estado_validacion', None)
        r.pago_tipo = getattr(p, 'tipo_pago', None)
        r.pago_fecha_validacion = getattr(p, 'fecha_validacion', None)
    
    # Calcular estadísticas
    total_reservas = reservas.count()
    pendientes = reservas.filter(estado='pendiente').count()
    confirmadas = reservas.filter(estado='confirmada').count()
    canceladas = reservas.filter(estado='cancelada').count()
    
    # Reservas activas (hoy está entre fecha_entrada y fecha_salida)
    from django.utils import timezone
    hoy = timezone.now().date()
    activas = reservas.filter(
        fecha_entrada__lte=hoy,
        fecha_salida__gte=hoy,
        estado__in=['confirmada', 'pendiente']
    ).count()
    
    context = {
        'reservas': reservas,
        'stats': {
            'total': total_reservas,
            'pendientes': pendientes,
            'confirmadas': confirmadas,
            'canceladas': canceladas,
            'activas': activas
        }
    }
    
    return render(request, 'reservas/reservasRecepcionista/todas_reservas.html', context)


@login_required
@require_http_methods(["GET"])
def obtener_detalle_reserva_api(request, reserva_id):
    """
    API para obtener detalles completos de una reserva.
    """
    try:
        # Obtener la reserva con relaciones
        reserva = get_object_or_404(
            Reserva.objects.select_related('habitacion', 'cliente'),
            id=reserva_id
        )

        # Usuario que registró la reserva
        creador_user = getattr(reserva, 'creada_por', None)
        if not creador_user and getattr(reserva, 'origen', None) == 'online':
            # Para reservas antiguas (antes del campo), intentar inferir por email del cliente
            from django.contrib.auth.models import User
            creador_user = User.objects.filter(email__iexact=reserva.cliente.email).first()

        creador_perfil = None
        try:
            if creador_user:
                creador_perfil = PerfilUsuario.objects.select_related('rol').get(usuario=creador_user)
        except Exception:
            creador_perfil = None

        # Último pago (si existe)
        pago = Pago.objects.filter(reserva=reserva).order_by('-fecha_pago').first()
        pago_existe = bool(pago)
        pago_estado = getattr(pago, 'estado', None) if pago else None
        pago_validacion = getattr(pago, 'estado_validacion', None) if pago else None
        pago_pagado = bool(pago and pago.estado == 'validado' and pago.estado_validacion == 'aprobado')
        
        # Calcular noches
        noches = (reserva.fecha_salida - reserva.fecha_entrada).days
        
        # Construir respuesta
        data = {
            'success': True,
            'reserva': {
                'id': reserva.id,
                'estado': reserva.estado,
                'estado_display': reserva.get_estado_display(),
                'origen': getattr(reserva, 'origen', 'online'),
                'origen_display': reserva.get_origen_display() if hasattr(reserva, 'get_origen_display') else 'En línea',
                'precio_total': float(reserva.precio_total),
                'num_huespedes': reserva.num_huespedes,
                'fecha_entrada': reserva.fecha_entrada.strftime('%d/%m/%Y'),
                'fecha_salida': reserva.fecha_salida.strftime('%d/%m/%Y'),
                'noches': noches,
                'notas': reserva.notas or '',
                'creado': reserva.creado.strftime('%d/%m/%Y %H:%M'),
                'checkin_realizado': bool(getattr(reserva, 'checkin_realizado', False)),
                'checkout_realizado': bool(getattr(reserva, 'checkout_realizado', False)),
                'fecha_checkin': reserva.fecha_checkin.strftime('%d/%m/%Y %H:%M') if reserva.fecha_checkin else None,
                'fecha_checkout': reserva.fecha_checkout.strftime('%d/%m/%Y %H:%M') if reserva.fecha_checkout else None,
            },
            'pago': {
                'existe': pago_existe,
                'pagado': pago_pagado,
                'estado': pago_estado,
                'estado_validacion': pago_validacion,
                'tipo_pago': getattr(pago, 'tipo_pago', None) if pago else None,
                'fecha_pago': pago.fecha_pago.strftime('%d/%m/%Y %H:%M') if pago and pago.fecha_pago else None,
                'fecha_validacion': pago.fecha_validacion.strftime('%d/%m/%Y %H:%M') if pago and pago.fecha_validacion else None,
                'monto': float(pago.monto) if pago else None,
            },
            'creador': {
                'existe': bool(creador_user),
                'username': creador_user.username if creador_user else None,
                'nombre': (creador_user.get_full_name() or creador_user.username) if creador_user else None,
                'email': creador_user.email if creador_user else None,
                'rol': creador_perfil.rol.nombre if creador_perfil else None,
                'rol_display': creador_perfil.rol.get_nombre_display() if creador_perfil else None,
            },
            'cliente': {
                'nombre': f"{reserva.cliente.nombre} {reserva.cliente.apellido}",
                'email': reserva.cliente.email,
                'telefono': reserva.cliente.telefono,
                'documento': f"{reserva.cliente.get_tipo_documento_display()}: {reserva.cliente.numero_documento}",
            },
            'habitacion': {
                'numero': reserva.habitacion.numero,
                'nombre': reserva.habitacion.nombre,
                'tipo': reserva.habitacion.get_tipo_display(),
                'capacidad': reserva.habitacion.capacidad,
                'precio_noche': float(reserva.habitacion.precio_noche),
                'estado': reserva.habitacion.get_estado_display(),
            }
        }

        # Acompañantes (si existen)
        try:
            data['acompanantes'] = [
                {
                    'id': a.id,
                    'nombre': a.nombre,
                    'apellido': a.apellido or '',
                    'tipo_documento': a.tipo_documento,
                    'numero_documento': a.numero_documento or '',
                    'telefono': a.telefono or '',
                }
                for a in reserva.acompanantes.all()
            ]
        except Exception:
            data['acompanantes'] = []
        
        return JsonResponse(data)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error al obtener detalles: {str(e)}'
        }, status=500)


@login_required
@require_http_methods(["POST"])
def confirmar_reserva_api(request, reserva_id):
    """
    API para confirmar una reserva pendiente.
    Actualiza el estado de la reserva y de la habitación.
    """
    try:
        if not es_staff_reservas(request.user):
            return JsonResponse({'success': False, 'message': 'No tienes permisos para confirmar reservas'}, status=403)

        # Obtener la reserva
        reserva = get_object_or_404(Reserva, id=reserva_id)
        
        # Verificar que esté en estado pendiente
        if reserva.estado != 'pendiente':
            return JsonResponse({
                'success': False,
                'message': f'Solo se pueden confirmar reservas pendientes. Estado actual: {reserva.get_estado_display()}'
            }, status=400)
        
        # Confirmar la reserva y actualizar habitación
        with transaction.atomic():
            reserva.estado = 'confirmada'
            reserva.save()
            
            # Actualizar el estado de la habitación a "ocupada"
            habitacion = reserva.habitacion
            habitacion.estado = 'ocupada'
            habitacion.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Reserva confirmada exitosamente',
            'data': {
                'reserva_id': reserva.id,
                'estado': reserva.get_estado_display(),
                'habitacion_estado': habitacion.get_estado_display()
            }
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error al confirmar la reserva: {str(e)}'
        }, status=500)


@login_required
@require_http_methods(["POST"])
def cancelar_reserva_api(request, reserva_id):
    """
    API para cancelar una reserva existente.
    - Clientes: solo pueden cancelar sus propias reservas
    - Recepcionistas/Administradores: pueden cancelar cualquier reserva
    """
    try:
        # Verificar el rol del usuario
        try:
            perfil = request.user.perfil
            rol = perfil.rol.nombre
            es_staff = rol in ['administrador', 'recepcionista']
        except:
            es_staff = False
        
        # Obtener la reserva
        if es_staff:
            # Staff puede cancelar cualquier reserva
            reserva = get_object_or_404(Reserva, id=reserva_id)
        else:
            # Cliente solo puede cancelar sus propias reservas
            try:
                cliente = Cliente.objects.get(email=request.user.email)
                reserva = get_object_or_404(Reserva, id=reserva_id, cliente=cliente)
            except Cliente.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'No tienes permisos para cancelar esta reserva'
                }, status=403)
        
        # Verificar que la reserva pueda ser cancelada
        if reserva.estado in ['cancelada', 'finalizada']:
            return JsonResponse({
                'success': False,
                'message': f'No se puede cancelar una reserva {reserva.get_estado_display()}'
            }, status=400)
        
        # Cancelar la reserva y liberar la habitación
        with transaction.atomic():
            reserva.estado = 'cancelada'
            reserva.save()
            
            # Cambiar el estado de la habitación a disponible
            habitacion = reserva.habitacion
            habitacion.estado = 'disponible'
            habitacion.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Reserva cancelada exitosamente',
            'data': {
                'reserva_id': reserva.id,
                'estado': reserva.get_estado_display()
            }
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error al cancelar la reserva: {str(e)}'
        }, status=500)


def _parse_json_body(request):
    try:
        return json.loads(request.body or '{}'), None
    except json.JSONDecodeError:
        return None, JsonResponse({'success': False, 'message': 'JSON inválido'}, status=400)


@login_required
@require_http_methods(["GET"])
def api_habitaciones_disponibles(request):
    """Listar habitaciones disponibles para un rango de fechas y cantidad de huéspedes (uso recepcionista)."""
    if not es_staff_reservas(request.user):
        return JsonResponse({'success': False, 'message': 'No tienes permisos'}, status=403)

    fecha_inicio = request.GET.get('fecha_inicio')
    fecha_fin = request.GET.get('fecha_fin')
    num_personas = request.GET.get('num_personas')

    if not all([fecha_inicio, fecha_fin, num_personas]):
        return JsonResponse({'success': False, 'message': 'Faltan parámetros requeridos'}, status=400)

    try:
        fecha_entrada = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
        fecha_salida = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse({'success': False, 'message': 'Formato de fecha inválido. Use YYYY-MM-DD'}, status=400)

    try:
        num_huespedes = int(num_personas)
    except Exception:
        return JsonResponse({'success': False, 'message': 'Número de personas inválido'}, status=400)

    if fecha_entrada >= fecha_salida:
        return JsonResponse({'success': False, 'message': 'La fecha fin debe ser posterior a la fecha inicio'}, status=400)

    # Partimos de habitaciones en estado disponible y con capacidad suficiente
    habitaciones_qs = Habitacion.objects.filter(
        estado='disponible',
        capacidad__gte=num_huespedes,
    ).order_by('numero')

    # Excluir habitaciones con reservas activas que se crucen en fechas
    reservas_conflictivas = Reserva.objects.filter(
        estado__in=['confirmada', 'pendiente'],
    )

    ocupadas_ids = set()
    for r in reservas_conflictivas.select_related('habitacion'):
        if not (fecha_salida <= r.fecha_entrada or fecha_entrada >= r.fecha_salida):
            ocupadas_ids.add(r.habitacion_id)

    if ocupadas_ids:
        habitaciones_qs = habitaciones_qs.exclude(id__in=list(ocupadas_ids))

    habitaciones = [
        {
            'id': h.id,
            'numero': h.numero,
            'nombre': h.nombre,
            'tipo': h.tipo,
            'tipo_label': h.get_tipo_display(),
            'capacidad': h.capacidad,
            'precio_noche': float(h.precio_noche),
        }
        for h in habitaciones_qs
    ]

    return JsonResponse({'success': True, 'habitaciones': habitaciones})


@login_required
@require_http_methods(["POST"])
def crear_reserva_presencial_api(request):
    """Crear reserva para un cliente (walk-in / recepcionista)."""
    if not es_staff_reservas(request.user):
        return JsonResponse({'success': False, 'message': 'No tienes permisos'}, status=403)

    datos, err = _parse_json_body(request)
    if err:
        return err

    cliente_id = datos.get('cliente_id')
    habitacion_id = datos.get('habitacion_id')
    fecha_inicio = datos.get('fecha_inicio')
    fecha_fin = datos.get('fecha_fin')
    num_personas = datos.get('num_personas')
    observaciones = (datos.get('observaciones') or '').strip()
    acompanantes = datos.get('acompanantes') or []

    checkin_inmediato = bool(datos.get('checkin_inmediato', True))
    registrar_pago = bool(datos.get('registrar_pago', False))
    tipo_pago = (datos.get('tipo_pago') or 'efectivo').strip()
    referencia = (datos.get('referencia') or '').strip()
    comentario_pago = (datos.get('comentario_pago') or '').strip()

    if not all([cliente_id, habitacion_id, fecha_inicio, fecha_fin, num_personas]):
        return JsonResponse({'success': False, 'message': 'Faltan datos requeridos'}, status=400)

    try:
        fecha_entrada = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
        fecha_salida = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse({'success': False, 'message': 'Formato de fecha inválido. Use YYYY-MM-DD'}, status=400)

    try:
        num_huespedes = int(num_personas)
    except Exception:
        return JsonResponse({'success': False, 'message': 'Número de personas inválido'}, status=400)

    cliente = get_object_or_404(Cliente, id=cliente_id)
    habitacion = get_object_or_404(Habitacion, id=habitacion_id, estado='disponible')

    # Calcular precio total
    num_noches = (fecha_salida - fecha_entrada).days
    if num_noches <= 0:
        return JsonResponse({'success': False, 'message': 'La fecha de salida debe ser posterior a la de entrada'}, status=400)

    precio_total = habitacion.precio_noche * num_noches

    with transaction.atomic():
        reserva = Reserva(
            habitacion=habitacion,
            cliente=cliente,
            creada_por=request.user,
            fecha_entrada=fecha_entrada,
            fecha_salida=fecha_salida,
            num_huespedes=num_huespedes,
            estado='confirmada' if checkin_inmediato else 'pendiente',
            origen='presencial',
            precio_total=precio_total,
            notas=observaciones,
        )

        try:
            reserva.save()
        except ValidationError as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=400)

        # Check-in inmediato (walk-in): ocupar habitación y marcar check-in
        if checkin_inmediato:
            reserva.checkin_realizado = True
            reserva.fecha_checkin = timezone.now()
            reserva.save(update_fields=['checkin_realizado', 'fecha_checkin', 'actualizado'])

            habitacion.estado = 'ocupada'
            habitacion.save(update_fields=['estado', 'actualizado'])

        # Guardar acompañantes
        if isinstance(acompanantes, list):
            for a in acompanantes:
                if not isinstance(a, dict):
                    continue
                nombre = (a.get('nombre') or '').strip()
                if not nombre:
                    continue
                AcompananteReserva.objects.create(
                    reserva=reserva,
                    nombre=nombre,
                    apellido=(a.get('apellido') or '').strip() or None,
                    tipo_documento=(a.get('tipo_documento') or 'ci').strip() or 'ci',
                    numero_documento=(a.get('numero_documento') or '').strip() or None,
                    telefono=(a.get('telefono') or '').strip() or None,
                )

        # Registrar pago presencial (validado directamente)
        if registrar_pago:
            pago = Pago.objects.filter(reserva=reserva).order_by('-fecha_pago').first()
            if pago:
                pago.tipo_pago = tipo_pago
                pago.estado_validacion = 'aprobado'
                pago.estado = 'validado'
                pago.validado_por = request.user
                pago.fecha_validacion = timezone.now()
                pago.referencia_transaccion = referencia
                pago.comentario_validacion = comentario_pago
                pago.save()

    return JsonResponse({
        'success': True,
        'message': 'Reserva presencial creada exitosamente',
        'data': {
            'reserva_id': reserva.id,
            'estado': reserva.estado,
            'precio_total': float(reserva.precio_total),
            'num_noches': num_noches,
        }
    })


@login_required
@require_http_methods(["POST"])
def checkin_reserva_api(request, reserva_id):
    """Marcar check-in (ocupar habitación) para una reserva."""
    if not es_staff_reservas(request.user):
        return JsonResponse({'success': False, 'message': 'No tienes permisos'}, status=403)

    reserva = get_object_or_404(Reserva.objects.select_related('habitacion'), id=reserva_id)

    if reserva.estado in ['cancelada', 'finalizada']:
        return JsonResponse({'success': False, 'message': f'No se puede hacer check-in en una reserva {reserva.get_estado_display()}'}, status=400)

    with transaction.atomic():
        reserva.estado = 'confirmada'
        reserva.checkin_realizado = True
        reserva.fecha_checkin = timezone.now()
        reserva.save(update_fields=['estado', 'checkin_realizado', 'fecha_checkin', 'actualizado'])

        habitacion = reserva.habitacion
        if habitacion.estado != 'ocupada':
            habitacion.estado = 'ocupada'
            habitacion.save(update_fields=['estado', 'actualizado'])

    return JsonResponse({'success': True, 'message': 'Check-in realizado correctamente'})


@login_required
@require_http_methods(["POST"])
def checkout_reserva_api(request, reserva_id):
    """Marcar check-out (finalizar reserva) y actualizar estado de habitación."""
    if not es_staff_reservas(request.user):
        return JsonResponse({'success': False, 'message': 'No tienes permisos'}, status=403)

    reserva = get_object_or_404(Reserva.objects.select_related('habitacion'), id=reserva_id)

    if reserva.estado in ['cancelada', 'finalizada']:
        return JsonResponse({'success': False, 'message': f'No se puede hacer check-out en una reserva {reserva.get_estado_display()}'}, status=400)

    # Por defecto, al salir pasa a limpieza
    estado_habitacion = (request.POST.get('estado_habitacion') or 'limpieza').strip()
    if estado_habitacion not in {'limpieza', 'disponible', 'mantenimiento', 'fuera_servicio'}:
        estado_habitacion = 'limpieza'

    with transaction.atomic():
        reserva.estado = 'finalizada'
        reserva.checkout_realizado = True
        reserva.fecha_checkout = timezone.now()
        reserva.save(update_fields=['estado', 'checkout_realizado', 'fecha_checkout', 'actualizado'])

        habitacion = reserva.habitacion
        habitacion.estado = estado_habitacion
        habitacion.save(update_fields=['estado', 'actualizado'])

    return JsonResponse({'success': True, 'message': 'Check-out realizado correctamente'})


@login_required
@require_http_methods(["POST"])
def registrar_pago_presencial_api(request, reserva_id):
    """Registrar un pago presencial (validado) para una reserva existente."""
    if not es_staff_reservas(request.user):
        return JsonResponse({'success': False, 'message': 'No tienes permisos'}, status=403)

    reserva = get_object_or_404(Reserva, id=reserva_id)

    datos, _ = _parse_json_body(request)
    if datos is None:
        # Fallback para form-data
        datos = request.POST.dict()

    tipo_pago = (datos.get('tipo_pago') or 'efectivo').strip()
    referencia = (datos.get('referencia') or '').strip()
    comentario_pago = (datos.get('comentario_pago') or '').strip()

    pago = Pago.objects.filter(reserva=reserva).order_by('-fecha_pago').first()
    if not pago:
        return JsonResponse({'success': False, 'message': 'No existe un pago asociado a esta reserva'}, status=400)

    pago.tipo_pago = tipo_pago
    pago.estado_validacion = 'aprobado'
    pago.estado = 'validado'
    pago.validado_por = request.user
    pago.fecha_validacion = timezone.now()
    pago.referencia_transaccion = referencia
    pago.comentario_validacion = comentario_pago
    pago.save()

    # Si todo está aprobado, asegurar confirmación
    if reserva.estado == 'pendiente':
        reserva.estado = 'confirmada'
        reserva.save(update_fields=['estado', 'actualizado'])

    return JsonResponse({'success': True, 'message': 'Pago presencial registrado y validado correctamente'})
