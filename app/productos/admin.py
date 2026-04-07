from django.contrib import admin

from .models import CategoriaProducto, Producto, Venta, VentaDetalle


@admin.register(CategoriaProducto)
class CategoriaProductoAdmin(admin.ModelAdmin):
    list_display = ("nombre", "activo", "creado")
    search_fields = ("nombre",)
    list_filter = ("activo",)


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ("nombre", "categoria", "tipo", "precio_venta", "stock_actual", "activo")
    search_fields = ("nombre", "codigo_sku")
    list_filter = ("activo", "tipo", "categoria")


class VentaDetalleInline(admin.TabularInline):
    model = VentaDetalle
    extra = 0


@admin.register(Venta)
class VentaAdmin(admin.ModelAdmin):
    list_display = ("id", "cliente", "estado", "metodo_pago", "total", "creado")
    list_filter = ("estado", "metodo_pago")
    inlines = [VentaDetalleInline]
