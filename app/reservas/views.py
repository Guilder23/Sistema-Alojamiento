from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ValidationError
from django.db import transaction
from datetime import datetime
from decimal import Decimal

from app.habitaciones.models import Habitacion
from app.clientes.models import Cliente
from app.autenticacion.models import PerfilUsuario
from .models import Reserva


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
            cedula = perfil.cedula or 'TEMP'
        except PerfilUsuario.DoesNotExist:
            telefono = '0000000000'
            cedula = 'TEMP'
        
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
                fecha_entrada=fecha_entrada,
                fecha_salida=fecha_salida,
                num_huespedes=num_huespedes,
                estado='pendiente',
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
    # Obtener todas las reservas ordenadas por fecha
    reservas = Reserva.objects.select_related(
        'habitacion', 'cliente'
    ).order_by('-fecha_entrada')
    
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
        
        # Calcular noches
        noches = (reserva.fecha_salida - reserva.fecha_entrada).days
        
        # Construir respuesta
        data = {
            'success': True,
            'reserva': {
                'id': reserva.id,
                'estado': reserva.estado,
                'estado_display': reserva.get_estado_display(),
                'precio_total': float(reserva.precio_total),
                'num_huespedes': reserva.num_huespedes,
                'fecha_entrada': reserva.fecha_entrada.strftime('%d/%m/%Y'),
                'fecha_salida': reserva.fecha_salida.strftime('%d/%m/%Y'),
                'noches': noches,
                'notas': reserva.notas or '',
                'creado': reserva.creado.strftime('%d/%m/%Y %H:%M'),
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
