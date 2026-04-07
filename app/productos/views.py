"""Vistas para productos, categorias y ventas."""

import json
from decimal import Decimal

from django.contrib.auth.decorators import login_required, user_passes_test
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.http import require_http_methods

from app.clientes.models import Cliente

from .models import CategoriaProducto, Producto, Venta, VentaDetalle


def es_administrador(user):
    try:
        if user.is_superuser:
            return True
        return user.perfil.rol.nombre == "administrador"
    except Exception:
        return False


def es_recepcionista(user):
    try:
        return user.perfil.rol.nombre == "recepcionista"
    except Exception:
        return False


def es_cliente(user):
    try:
        return user.perfil.rol.nombre == "cliente"
    except Exception:
        return False


def puede_listar_productos(user):
    return es_administrador(user) or es_recepcionista(user)


@login_required(login_url="autenticacion:login")
@user_passes_test(es_administrador)
def productos_view(request):
    context = {
        "titulo": "Gestion de Productos",
    }
    return render(request, "productos/productos.html", context)


@login_required(login_url="autenticacion:login")
@user_passes_test(es_administrador)
def categorias_view(request):
    context = {
        "titulo": "Gestion de Categorias",
    }
    return render(request, "productos/categorias.html", context)


@login_required(login_url="autenticacion:login")
@user_passes_test(es_recepcionista)
def ventas_view(request):
    context = {
        "titulo": "Gestion de Ventas",
    }
    return render(request, "productos/ventas.html", context)


@login_required(login_url="autenticacion:login")
@user_passes_test(es_cliente)
def mis_compras_view(request):
    cliente = None
    compras = []
    if request.user.email:
        cliente = Cliente.objects.filter(email=request.user.email).first()
    if cliente:
        compras = Venta.objects.filter(cliente=cliente).prefetch_related("detalles__producto").order_by("-creado")

    context = {
        "titulo": "Mis Compras",
        "compras": compras,
        "cliente": cliente,
    }
    return render(request, "productos/cliente/mis_compras.html", context)


@login_required(login_url="autenticacion:login")
@user_passes_test(puede_listar_productos)
@require_http_methods(["GET"])
def api_productos_lista(request):
    queryset = Producto.objects.select_related("categoria").order_by("nombre")
    if es_recepcionista(request.user) and not es_administrador(request.user):
        queryset = queryset.filter(activo=True)

    productos = []
    for producto in queryset:
        productos.append({
            "id": producto.id,
            "nombre": producto.nombre,
            "categoria_id": producto.categoria_id,
            "categoria_nombre": producto.categoria.nombre,
            "codigo_sku": producto.codigo_sku or "",
            "tipo": producto.tipo,
            "precio_venta": str(producto.precio_venta),
            "maneja_stock": producto.maneja_stock,
            "stock_actual": producto.stock_actual,
            "stock_minimo": producto.stock_minimo,
            "activo": producto.activo,
        })

    return JsonResponse({"success": True, "productos": productos})


@login_required(login_url="autenticacion:login")
@user_passes_test(es_administrador)
@require_http_methods(["GET"])
def api_producto_detalle(request, producto_id):
    producto = get_object_or_404(Producto, pk=producto_id)

    return JsonResponse({
        "success": True,
        "producto": {
            "id": producto.id,
            "nombre": producto.nombre,
            "categoria_id": producto.categoria_id,
            "categoria_nombre": producto.categoria.nombre,
            "codigo_sku": producto.codigo_sku or "",
            "descripcion": producto.descripcion or "",
            "tipo": producto.tipo,
            "precio_venta": str(producto.precio_venta),
            "costo": str(producto.costo) if producto.costo is not None else "",
            "impuesto_pct": str(producto.impuesto_pct),
            "maneja_stock": producto.maneja_stock,
            "stock_actual": producto.stock_actual,
            "stock_minimo": producto.stock_minimo,
            "activo": producto.activo,
        }
    })


def _parse_decimal(value, default="0"):
    try:
        return Decimal(str(value))
    except Exception:
        return Decimal(str(default))


@login_required(login_url="autenticacion:login")
@user_passes_test(es_administrador)
@require_http_methods(["POST"])
def api_producto_crear(request):
    try:
        datos = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "JSON invalido"}, status=400)

    nombre = (datos.get("nombre") or "").strip()
    categoria_id = datos.get("categoria_id")
    codigo_sku = (datos.get("codigo_sku") or "").strip() or None
    descripcion = (datos.get("descripcion") or "").strip() or None
    tipo = datos.get("tipo") or "producto"
    precio_venta = _parse_decimal(datos.get("precio_venta"), default="0")
    costo = datos.get("costo")
    impuesto_pct = _parse_decimal(datos.get("impuesto_pct"), default="0")
    maneja_stock = bool(datos.get("maneja_stock", True))
    stock_actual = int(datos.get("stock_actual", 0) or 0)
    stock_minimo = int(datos.get("stock_minimo", 0) or 0)
    activo = bool(datos.get("activo", True))

    if not nombre:
        return JsonResponse({"success": False, "error": "Nombre es requerido"}, status=400)
    if not categoria_id:
        return JsonResponse({"success": False, "error": "Categoria es requerida"}, status=400)
    if precio_venta < 0:
        return JsonResponse({"success": False, "error": "Precio de venta invalido"}, status=400)

    categoria = get_object_or_404(CategoriaProducto, pk=categoria_id)

    if tipo == "servicio":
        maneja_stock = False
        stock_actual = 0
        stock_minimo = 0

    producto = Producto.objects.create(
        nombre=nombre,
        categoria=categoria,
        codigo_sku=codigo_sku,
        descripcion=descripcion,
        tipo=tipo,
        precio_venta=precio_venta,
        costo=_parse_decimal(costo) if costo not in (None, "") else None,
        impuesto_pct=impuesto_pct,
        maneja_stock=maneja_stock,
        stock_actual=stock_actual,
        stock_minimo=stock_minimo,
        activo=activo,
    )

    return JsonResponse({"success": True, "message": "Producto creado", "producto_id": producto.id})


@login_required(login_url="autenticacion:login")
@user_passes_test(es_administrador)
@require_http_methods(["PUT", "POST"])
def api_producto_actualizar(request, producto_id):
    producto = get_object_or_404(Producto, pk=producto_id)
    try:
        datos = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "JSON invalido"}, status=400)

    nombre = (datos.get("nombre") or "").strip()
    categoria_id = datos.get("categoria_id")
    codigo_sku = (datos.get("codigo_sku") or "").strip() or None
    descripcion = (datos.get("descripcion") or "").strip() or None
    tipo = datos.get("tipo") or "producto"
    precio_venta = _parse_decimal(datos.get("precio_venta"), default=str(producto.precio_venta))
    costo = datos.get("costo")
    impuesto_pct = _parse_decimal(datos.get("impuesto_pct"), default=str(producto.impuesto_pct))
    maneja_stock = bool(datos.get("maneja_stock", producto.maneja_stock))
    stock_actual = int(datos.get("stock_actual", producto.stock_actual) or 0)
    stock_minimo = int(datos.get("stock_minimo", producto.stock_minimo) or 0)
    activo = bool(datos.get("activo", producto.activo))

    if not nombre:
        return JsonResponse({"success": False, "error": "Nombre es requerido"}, status=400)
    if not categoria_id:
        return JsonResponse({"success": False, "error": "Categoria es requerida"}, status=400)
    if precio_venta < 0:
        return JsonResponse({"success": False, "error": "Precio de venta invalido"}, status=400)

    categoria = get_object_or_404(CategoriaProducto, pk=categoria_id)

    if tipo == "servicio":
        maneja_stock = False
        stock_actual = 0
        stock_minimo = 0

    producto.nombre = nombre
    producto.categoria = categoria
    producto.codigo_sku = codigo_sku
    producto.descripcion = descripcion
    producto.tipo = tipo
    producto.precio_venta = precio_venta
    producto.costo = _parse_decimal(costo) if costo not in (None, "") else None
    producto.impuesto_pct = impuesto_pct
    producto.maneja_stock = maneja_stock
    producto.stock_actual = stock_actual
    producto.stock_minimo = stock_minimo
    producto.activo = activo
    producto.save()

    return JsonResponse({"success": True, "message": "Producto actualizado"})


@login_required(login_url="autenticacion:login")
@user_passes_test(es_administrador)
@require_http_methods(["DELETE", "POST"])
def api_producto_eliminar(request, producto_id):
    producto = get_object_or_404(Producto, pk=producto_id)
    producto.activo = False
    producto.save(update_fields=["activo"])
    return JsonResponse({"success": True, "message": "Producto desactivado"})


@login_required(login_url="autenticacion:login")
@user_passes_test(es_administrador)
@require_http_methods(["GET"])
def api_categorias_lista(request):
    categorias = CategoriaProducto.objects.order_by("nombre")
    data = [
        {
            "id": categoria.id,
            "nombre": categoria.nombre,
            "descripcion": categoria.descripcion or "",
            "activo": categoria.activo,
        }
        for categoria in categorias
    ]
    return JsonResponse({"success": True, "categorias": data})


@login_required(login_url="autenticacion:login")
@user_passes_test(es_administrador)
@require_http_methods(["POST"])
def api_categoria_crear(request):
    try:
        datos = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "JSON invalido"}, status=400)

    nombre = (datos.get("nombre") or "").strip()
    descripcion = (datos.get("descripcion") or "").strip() or None
    activo = bool(datos.get("activo", True))

    if not nombre:
        return JsonResponse({"success": False, "error": "Nombre es requerido"}, status=400)
    if CategoriaProducto.objects.filter(nombre__iexact=nombre).exists():
        return JsonResponse({"success": False, "error": "La categoria ya existe"}, status=400)

    categoria = CategoriaProducto.objects.create(nombre=nombre, descripcion=descripcion, activo=activo)
    return JsonResponse({"success": True, "message": "Categoria creada", "categoria_id": categoria.id})


@login_required(login_url="autenticacion:login")
@user_passes_test(es_administrador)
@require_http_methods(["PUT", "POST"])
def api_categoria_actualizar(request, categoria_id):
    categoria = get_object_or_404(CategoriaProducto, pk=categoria_id)
    try:
        datos = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "JSON invalido"}, status=400)

    nombre = (datos.get("nombre") or "").strip()
    descripcion = (datos.get("descripcion") or "").strip() or None
    activo = bool(datos.get("activo", categoria.activo))

    if not nombre:
        return JsonResponse({"success": False, "error": "Nombre es requerido"}, status=400)
    if CategoriaProducto.objects.filter(nombre__iexact=nombre).exclude(id=categoria_id).exists():
        return JsonResponse({"success": False, "error": "La categoria ya existe"}, status=400)

    categoria.nombre = nombre
    categoria.descripcion = descripcion
    categoria.activo = activo
    categoria.save()

    return JsonResponse({"success": True, "message": "Categoria actualizada"})


@login_required(login_url="autenticacion:login")
@user_passes_test(es_administrador)
@require_http_methods(["DELETE", "POST"])
def api_categoria_eliminar(request, categoria_id):
    categoria = get_object_or_404(CategoriaProducto, pk=categoria_id)
    categoria.activo = False
    categoria.save(update_fields=["activo"])
    return JsonResponse({"success": True, "message": "Categoria desactivada"})


@login_required(login_url="autenticacion:login")
@user_passes_test(es_recepcionista)
@require_http_methods(["GET"])
def api_ventas_lista(request):
    ventas = Venta.objects.select_related("cliente").order_by("-creado")
    data = []
    for venta in ventas:
        data.append({
            "id": venta.id,
            "cliente": venta.cliente.nombre_completo if venta.cliente else "Sin cliente",
            "cliente_id": venta.cliente.id if venta.cliente else None,
            "estado": venta.estado,
            "metodo_pago": venta.metodo_pago,
            "total": str(venta.total),
            "creado": venta.creado.isoformat(),
        })
    return JsonResponse({"success": True, "ventas": data})


@login_required(login_url="autenticacion:login")
@user_passes_test(es_recepcionista)
@require_http_methods(["GET"])
def api_venta_detalle(request, venta_id):
    venta = get_object_or_404(Venta, pk=venta_id)
    detalles = []
    for detalle in venta.detalles.select_related("producto"):
        detalles.append({
            "id": detalle.id,
            "producto": detalle.producto.nombre,
            "cantidad": detalle.cantidad,
            "precio_unitario": str(detalle.precio_unitario),
            "subtotal": str(detalle.subtotal),
        })

    return JsonResponse({
        "success": True,
        "venta": {
            "id": venta.id,
            "cliente": venta.cliente.nombre_completo if venta.cliente else "Sin cliente",
            "estado": venta.estado,
            "metodo_pago": venta.metodo_pago,
            "total": str(venta.total),
            "creado": venta.creado.isoformat(),
            "detalles": detalles,
        }
    })


@login_required(login_url="autenticacion:login")
@user_passes_test(es_recepcionista)
@require_http_methods(["POST"])
def api_venta_crear(request):
    try:
        datos = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "JSON invalido"}, status=400)

    cliente_id = datos.get("cliente_id")
    items = datos.get("items", [])
    metodo_pago = datos.get("metodo_pago", "efectivo")
    notas = (datos.get("notas") or "").strip() or None

    if not cliente_id:
        return JsonResponse({"success": False, "error": "Cliente es requerido"}, status=400)
    if not items:
        return JsonResponse({"success": False, "error": "Debe agregar productos"}, status=400)

    cliente = get_object_or_404(Cliente, pk=cliente_id)

    with transaction.atomic():
        venta = Venta.objects.create(
            cliente=cliente,
            creado_por=request.user,
            metodo_pago=metodo_pago,
            estado="pagada",
            notas=notas,
        )

        total = Decimal("0.00")
        for item in items:
            producto_id = item.get("producto_id")
            cantidad = int(item.get("cantidad") or 0)

            if not producto_id or cantidad <= 0:
                transaction.set_rollback(True)
                return JsonResponse({"success": False, "error": "Productos invalidos"}, status=400)

            try:
                producto = Producto.objects.select_for_update().get(pk=producto_id, activo=True)
            except Producto.DoesNotExist:
                transaction.set_rollback(True)
                return JsonResponse({"success": False, "error": "Producto no encontrado"}, status=404)
            if producto.maneja_stock and producto.stock_actual < cantidad:
                transaction.set_rollback(True)
                return JsonResponse({"success": False, "error": f"Stock insuficiente para {producto.nombre}"}, status=400)

            precio_unitario = producto.precio_venta
            subtotal = precio_unitario * cantidad

            VentaDetalle.objects.create(
                venta=venta,
                producto=producto,
                cantidad=cantidad,
                precio_unitario=precio_unitario,
                subtotal=subtotal,
            )

            if producto.maneja_stock:
                producto.stock_actual = producto.stock_actual - cantidad
                producto.save(update_fields=["stock_actual"])

            total += subtotal

        venta.total = total
        venta.save(update_fields=["total"])

    return JsonResponse({"success": True, "message": "Venta registrada", "venta_id": venta.id})


@login_required(login_url="autenticacion:login")
@user_passes_test(es_recepcionista)
@require_http_methods(["POST"])
def api_venta_cancelar(request, venta_id):
    venta = get_object_or_404(Venta, pk=venta_id)
    if venta.estado == "cancelada":
        return JsonResponse({"success": False, "error": "La venta ya esta cancelada"}, status=400)

    with transaction.atomic():
        for detalle in venta.detalles.select_related("producto").select_for_update():
            if detalle.producto.maneja_stock:
                detalle.producto.stock_actual += detalle.cantidad
                detalle.producto.save(update_fields=["stock_actual"])

        venta.estado = "cancelada"
        venta.save(update_fields=["estado"])

    return JsonResponse({"success": True, "message": "Venta cancelada"})
