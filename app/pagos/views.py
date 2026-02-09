from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from django.template.loader import render_to_string

from app.reservas.models import Reserva
from app.clientes.models import Cliente
from app.autenticacion.models import PerfilUsuario
from .models import Pago, ConfiguracionQR


def es_recepcionista(user):
    """Verificar si el usuario es recepcionista"""
    try:
        return user.perfil.rol.nombre == 'recepcionista'
    except Exception:
        return False


def es_cliente(user):
    """Verificar si el usuario es cliente"""
    try:
        return user.perfil.rol.nombre == 'cliente'
    except Exception:
        return False


@login_required(login_url='autenticacion:login')
@user_passes_test(es_cliente)
def mis_pagos_view(request):
    """Vista de pagos del cliente"""
    try:
        # Obtener el cliente asociado al usuario
        cliente = Cliente.objects.get(email=request.user.email)
        
        # Obtener todas las reservas del cliente
        reservas = Reserva.objects.filter(cliente=cliente)
        pagos = Pago.objects.filter(reserva__cliente=cliente).select_related('reserva', 'reserva__habitacion').order_by('-fecha_pago')
        
        context = {
            'titulo': 'Mis Pagos',
            'pagos': pagos,
            'reservas': reservas,
            'cliente': cliente,
        }
        return render(request, 'pagos/cliente/mis_pagos.html', context)
    except Cliente.DoesNotExist:
        # Si el cliente no existe, mostrar página vacía
        context = {
            'titulo': 'Mis Pagos',
            'pagos': [],
            'reservas': [],
            'cliente': None,
        }
        return render(request, 'pagos/cliente/mis_pagos.html', context)


@login_required(login_url='autenticacion:login')
@user_passes_test(es_cliente)
def ver_qr_pago_view(request, pago_id):
    """Ver QR para pago"""
    try:
        cliente = Cliente.objects.get(email=request.user.email)
        pago = get_object_or_404(Pago, id=pago_id, reserva__cliente=cliente)
    except Cliente.DoesNotExist:
        return JsonResponse({'error': 'Cliente no encontrado'}, status=404)
    
    qr_config = ConfiguracionQR.objects.filter(estado='activo').first()
    
    if not qr_config or not qr_config.imagen_qr:
        return JsonResponse({'error': 'No hay QR configurado'}, status=404)
    
    context = {
        'pago': pago,
        'qr_config': qr_config,
        'reserva': pago.reserva,
    }
    return render(request, 'pagos/cliente/modals/modal_pagar_qr.html', context)


@login_required(login_url='autenticacion:login')
@user_passes_test(es_cliente)
@require_http_methods(["POST"])
def enviar_comprobante_view(request, pago_id):
    """Enviar comprobante de pago"""
    try:
        cliente = Cliente.objects.get(email=request.user.email)
        pago = get_object_or_404(Pago, id=pago_id, reserva__cliente=cliente)
    except Cliente.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Cliente no encontrado'}, status=404)
    
    if 'comprobante' not in request.FILES:
        return JsonResponse({'success': False, 'error': 'No se envió comprobante'}, status=400)
    
    try:
        pago.comprobante_cliente = request.FILES['comprobante']
        pago.estado = 'enviado'
        pago.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Comprobante enviado. Esperando validación.'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@login_required(login_url='autenticacion:login')
@user_passes_test(es_recepcionista)
def validar_pagos_view(request):
    """Vista de validación de pagos para recepcionista"""
    pagos_por_validar = Pago.objects.filter(
        estado='enviado',
        estado_validacion='pendiente'
    ).select_related('reserva', 'reserva__cliente').order_by('-fecha_pago')
    
    pagos_validados = Pago.objects.filter(
        estado_validacion__in=['aprobado', 'rechazado']
    ).select_related('reserva', 'reserva__cliente').order_by('-fecha_validacion')
    
    context = {
        'titulo': 'Validar Pagos',
        'pagos_por_validar': pagos_por_validar,
        'pagos_validados': pagos_validados,
    }
    return render(request, 'pagos/recepcionista/validar_pagos.html', context)


@login_required(login_url='autenticacion:login')
@user_passes_test(es_recepcionista)
@require_http_methods(["POST"])
def aprobar_pago_view(request, pago_id):
    """Aprobar un pago"""
    pago = get_object_or_404(Pago, id=pago_id)
    
    try:
        pago.estado_validacion = 'aprobado'
        pago.estado = 'validado'
        pago.validado_por = request.user
        pago.fecha_validacion = timezone.now()
        pago.referencia_transaccion = request.POST.get('referencia', '')
        pago.comentario_validacion = request.POST.get('comentario', '')
        pago.save()
        
        # Actualizar estado de la reserva si todos los pagos están validados
        if pago.reserva.pagos.filter(estado_validacion__in=['pendiente', 'rechazado']).count() == 0:
            pago.reserva.estado = 'confirmada'
            pago.reserva.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Pago aprobado correctamente'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@login_required(login_url='autenticacion:login')
@user_passes_test(es_recepcionista)
@require_http_methods(["POST"])
def rechazar_pago_view(request, pago_id):
    """Rechazar un pago"""
    pago = get_object_or_404(Pago, id=pago_id)
    
    try:
        pago.estado_validacion = 'rechazado'
        pago.estado = 'pendiente'
        pago.validado_por = request.user
        pago.fecha_validacion = timezone.now()
        pago.comentario_validacion = request.POST.get('motivo', 'El comprobante no es válido')
        pago.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Pago rechazado. Se notificará al cliente.'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@login_required(login_url='autenticacion:login')
@user_passes_test(es_cliente)
def descargar_pdf_confirmacion_view(request, pago_id):
    """Descargar PDF de confirmación de pago y reserva"""
    try:
        cliente = Cliente.objects.get(email=request.user.email)
        pago = get_object_or_404(Pago, id=pago_id, reserva__cliente=cliente)
    except Cliente.DoesNotExist:
        return JsonResponse({'error': 'Cliente no encontrado'}, status=404)
    
    if pago.estado_validacion != 'aprobado':
        return JsonResponse({'error': 'Pago aún no ha sido validado'}, status=400)
    
    try:
        # Renderizar template HTML para impresión/descarga como PDF
        context = {
            'pago': pago,
            'reserva': pago.reserva,
            'cliente': cliente,
        }
        return render(request, 'pagos/cliente/pdf_confirmacion.html', context)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required(login_url='autenticacion:login')
@require_http_methods(["GET"])
@login_required(login_url='autenticacion:login')
def obtener_qr_config_view(request):
    """API para obtener configuración de QR"""
    qr_config = ConfiguracionQR.objects.filter(estado='activo').first()
    
    if not qr_config:
        return JsonResponse({'error': 'No hay QR configurado'}, status=404)
    
    return JsonResponse({
        'id': qr_config.id,
        'descripcion': qr_config.descripcion,
        'imagen_qr': qr_config.imagen_qr.url if qr_config.imagen_qr else None,
    })


# ============================================
# VISTAS DE CONFIGURACIÓN QR (RECEPCIONISTA)
# ============================================

@login_required(login_url='autenticacion:login')
@user_passes_test(es_recepcionista)
def gestionar_qr_view(request):
    """Vista para gestionar configuraciones QR"""
    configuraciones = ConfiguracionQR.objects.all().order_by('-creado')
    
    context = {
        'titulo': 'Configuración de QR para Pagos',
        'configuraciones': configuraciones,
    }
    return render(request, 'pagos/recepcionista/gestionar_qr.html', context)


@login_required(login_url='autenticacion:login')
@user_passes_test(es_recepcionista)
@require_http_methods(["POST"])
def crear_qr_view(request):
    """Crear nueva configuración QR"""
    try:
        # Desactivar todas las configuraciones anteriores si se marca como activo
        if request.POST.get('estado') == 'activo':
            ConfiguracionQR.objects.all().update(estado='inactivo')
        
        qr_config = ConfiguracionQR.objects.create(
            codigo_qr=request.POST.get('codigo_qr'),
            descripcion=request.POST.get('descripcion', ''),
            estado=request.POST.get('estado', 'activo')
        )
        
        # Si se subió una imagen, asignarla
        if 'imagen_qr' in request.FILES:
            qr_config.imagen_qr = request.FILES['imagen_qr']
            qr_config.save()
        else:
            # Generar QR automáticamente si no se subió imagen
            qr_config.generar_qr()
        
        return JsonResponse({
            'success': True,
            'message': 'Configuración QR creada correctamente'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@login_required(login_url='autenticacion:login')
@user_passes_test(es_recepcionista)
@require_http_methods(["POST"])
def editar_qr_view(request, qr_id):
    """Editar configuración QR existente"""
    qr_config = get_object_or_404(ConfiguracionQR, id=qr_id)
    
    try:
        # Si se marca como activo, desactivar los demás
        if request.POST.get('estado') == 'activo':
            ConfiguracionQR.objects.exclude(id=qr_id).update(estado='inactivo')
        
        qr_config.codigo_qr = request.POST.get('codigo_qr')
        qr_config.descripcion = request.POST.get('descripcion', '')
        qr_config.estado = request.POST.get('estado', 'activo')
        
        # Actualizar imagen si se subió una nueva
        if 'imagen_qr' in request.FILES:
            qr_config.imagen_qr = request.FILES['imagen_qr']
        elif request.POST.get('regenerar_qr') == 'true':
            # Regenerar QR automáticamente
            qr_config.generar_qr()
        
        qr_config.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Configuración QR actualizada correctamente'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@login_required(login_url='autenticacion:login')
@user_passes_test(es_recepcionista)
@require_http_methods(["POST"])
def activar_qr_view(request, qr_id):
    """Activar una configuración QR y desactivar las demás"""
    try:
        # Desactivar todas las configuraciones
        ConfiguracionQR.objects.all().update(estado='inactivo')
        
        # Activar la seleccionada
        qr_config = get_object_or_404(ConfiguracionQR, id=qr_id)
        qr_config.estado = 'activo'
        qr_config.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Configuración QR activada correctamente'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@login_required(login_url='autenticacion:login')
@user_passes_test(es_recepcionista)
@require_http_methods(["POST"])
def eliminar_qr_view(request, qr_id):
    """Eliminar configuración QR"""
    try:
        qr_config = get_object_or_404(ConfiguracionQR, id=qr_id)
        
        # No permitir eliminar si es el único activo
        if qr_config.estado == 'activo' and ConfiguracionQR.objects.filter(estado='activo').count() == 1:
            return JsonResponse({
                'success': False,
                'error': 'No puedes eliminar la única configuración activa'
            }, status=400)
        
        qr_config.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Configuración QR eliminada correctamente'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
