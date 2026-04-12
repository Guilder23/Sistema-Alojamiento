"""
Estadísticas agregadas para el dashboard de administración (gráficos y KPIs).
"""
from __future__ import annotations

from datetime import date
from decimal import Decimal

from dateutil.relativedelta import relativedelta
from django.contrib.auth.models import User
from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone

from app.clientes.models import Cliente
from app.habitaciones.models import Habitacion
from app.pagos.models import Pago
from app.productos.models import CategoriaProducto, Producto
from app.reservas.models import Reserva


def _month_series_last_n(n: int = 6):
    """Lista de (primer_día_mes, etiqueta corta en español)."""
    today = timezone.localdate()
    first_this = date(today.year, today.month, 1)
    out = []
    for i in range(n - 1, -1, -1):
        d = first_this - relativedelta(months=i)
        meses = (
            '', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
        )
        label = f"{meses[d.month]} {d.year}"
        out.append((d, label))
    return out


def _float_or_zero(x) -> float:
    if x is None:
        return 0.0
    if isinstance(x, Decimal):
        return float(x)
    return float(x)


def build_admin_dashboard_payload() -> dict:
    """
    Devuelve un dict serializable a JSON para Chart.js y KPIs en plantilla.
    """
    month_keys = _month_series_last_n(6)
    start_date = month_keys[0][0]

    # --- KPIs ---
    total_reservas = Reserva.objects.count()
    reservas_activas = Reserva.objects.filter(
        estado__in=['pendiente', 'confirmada']
    ).count()
    total_habitaciones = Habitacion.objects.count()
    habitaciones_disponibles = Habitacion.objects.filter(estado='disponible').count()
    total_clientes = Cliente.objects.filter(activo=True).count()
    total_usuarios = User.objects.count()
    total_productos = Producto.objects.count()
    total_categorias = CategoriaProducto.objects.count()

    inicio_mes = timezone.localdate().replace(day=1)
    pagos_validados = Pago.objects.filter(
        Q(estado='validado') | Q(estado_validacion='aprobado')
    )
    ingresos_mes = pagos_validados.filter(fecha_pago__date__gte=inicio_mes).aggregate(
        t=Sum('monto')
    )['t'] or Decimal('0')

    # Reservas nuevas este mes (por fecha de creación)
    reservas_mes = Reserva.objects.filter(creado__date__gte=inicio_mes).count()

    # --- Reservas por mes (línea / barras) ---
    res_by_m_raw = (
        Reserva.objects.filter(creado__date__gte=start_date)
        .annotate(m=TruncMonth('creado'))
        .values('m')
        .annotate(c=Count('id'))
        .order_by('m')
    )
    rmap = {row['m'].date().replace(day=1): row['c'] for row in res_by_m_raw if row['m']}
    reservas_por_mes_labels = [lbl for _, lbl in month_keys]
    reservas_por_mes_values = [rmap.get(d, 0) for d, _ in month_keys]

    # --- Ingresos por mes (pagos validados) ---
    ing_by_m_raw = (
        pagos_validados.filter(fecha_pago__date__gte=start_date)
        .annotate(m=TruncMonth('fecha_pago'))
        .values('m')
        .annotate(t=Sum('monto'))
        .order_by('m')
    )
    imap = {}
    for row in ing_by_m_raw:
        if row['m']:
            key = row['m'].date().replace(day=1)
            imap[key] = _float_or_zero(row['t'])
    ingresos_por_mes_values = [imap.get(d, 0.0) for d, _ in month_keys]

    # --- Reservas por estado (doughnut) ---
    estados_res = (
        Reserva.objects.values('estado')
        .annotate(c=Count('id'))
        .order_by('-c')
    )
    estado_labels_map = dict(Reserva.ESTADOS_RESERVA)
    res_estado_labels = [estado_labels_map.get(r['estado'], r['estado']) for r in estados_res]
    res_estado_values = [r['c'] for r in estados_res]

    # --- Habitaciones por estado ---
    estados_hab = (
        Habitacion.objects.values('estado')
        .annotate(c=Count('id'))
        .order_by('-c')
    )
    hab_estado_labels_map = dict(Habitacion.ESTADOS_HABITACION)
    hab_estado_labels = [hab_estado_labels_map.get(r['estado'], r['estado']) for r in estados_hab]
    hab_estado_values = [r['c'] for r in estados_hab]

    # --- Habitaciones por tipo (bar horizontal) ---
    tipos_hab = (
        Habitacion.objects.values('tipo')
        .annotate(c=Count('id'))
        .order_by('-c')
    )
    tipo_labels_map = dict(Habitacion.TIPOS_HABITACION)
    hab_tipo_labels = [tipo_labels_map.get(r['tipo'], r['tipo']) for r in tipos_hab]
    hab_tipo_values = [r['c'] for r in tipos_hab]

    # --- Origen reservas (pie) ---
    origen = (
        Reserva.objects.values('origen')
        .annotate(c=Count('id'))
        .order_by('-c')
    )
    origen_map = dict(Reserva.ORIGEN_RESERVA)
    origen_labels = [origen_map.get(r['origen'], r['origen']) for r in origen]
    origen_values = [r['c'] for r in origen]

    # --- Pagos por tipo (bar) ---
    tipos_pago = (
        Pago.objects.values('tipo_pago')
        .annotate(c=Count('id'))
        .order_by('-c')
    )
    # TIPOS_PAGO choices
    tp_map = dict(Pago.TIPOS_PAGO)
    pago_tipo_labels = [tp_map.get(r['tipo_pago'], r['tipo_pago'] or '—') for r in tipos_pago]
    pago_tipo_values = [r['c'] for r in tipos_pago]

    # --- Ocupación aproximada: reservas con check-in hoy o estancia activa ---
    hoy = timezone.localdate()
    en_estancia = Reserva.objects.filter(
        estado__in=['pendiente', 'confirmada'],
        fecha_entrada__lte=hoy,
        fecha_salida__gt=hoy,
    ).count()

    return {
        'kpis': {
            'total_reservas': total_reservas,
            'reservas_activas': reservas_activas,
            'reservas_mes': reservas_mes,
            'en_estancia_hoy': en_estancia,
            'total_habitaciones': total_habitaciones,
            'habitaciones_disponibles': habitaciones_disponibles,
            'total_clientes': total_clientes,
            'total_usuarios': total_usuarios,
            'total_productos': total_productos,
            'total_categorias': total_categorias,
            'ingresos_mes': _float_or_zero(ingresos_mes),
        },
        'charts': {
            'reservas_por_mes': {
                'labels': reservas_por_mes_labels,
                'values': reservas_por_mes_values,
            },
            'ingresos_por_mes': {
                'labels': reservas_por_mes_labels,
                'values': ingresos_por_mes_values,
            },
            'reservas_por_estado': {
                'labels': res_estado_labels,
                'values': res_estado_values,
            },
            'habitaciones_por_estado': {
                'labels': hab_estado_labels,
                'values': hab_estado_values,
            },
            'habitaciones_por_tipo': {
                'labels': hab_tipo_labels,
                'values': hab_tipo_values,
            },
            'origen_reservas': {
                'labels': origen_labels,
                'values': origen_values,
            },
            'pagos_por_tipo': {
                'labels': pago_tipo_labels,
                'values': pago_tipo_values,
            },
        },
    }


def user_is_administrador(user) -> bool:
    if not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    try:
        return user.perfil.rol.nombre == 'administrador'
    except Exception:
        return False
