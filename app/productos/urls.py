"""URLs para gestion de productos, categorias y ventas."""

from django.urls import path

from . import views

app_name = "productos"

urlpatterns = [
    path("", views.productos_view, name="list"),
    path("categorias/", views.categorias_view, name="categorias"),
    path("ventas/", views.ventas_view, name="ventas"),
    path("mis-compras/", views.mis_compras_view, name="mis_compras"),
    path("api/productos/lista/", views.api_productos_lista, name="api_productos_lista"),
    path("api/productos/detalle/<int:producto_id>/", views.api_producto_detalle, name="api_producto_detalle"),
    path("api/productos/crear/", views.api_producto_crear, name="api_producto_crear"),
    path("api/productos/actualizar/<int:producto_id>/", views.api_producto_actualizar, name="api_producto_actualizar"),
    path("api/productos/eliminar/<int:producto_id>/", views.api_producto_eliminar, name="api_producto_eliminar"),
    path("api/categorias/lista/", views.api_categorias_lista, name="api_categorias_lista"),
    path("api/categorias/crear/", views.api_categoria_crear, name="api_categoria_crear"),
    path("api/categorias/actualizar/<int:categoria_id>/", views.api_categoria_actualizar, name="api_categoria_actualizar"),
    path("api/categorias/eliminar/<int:categoria_id>/", views.api_categoria_eliminar, name="api_categoria_eliminar"),
    path("api/ventas/lista/", views.api_ventas_lista, name="api_ventas_lista"),
    path("api/ventas/detalle/<int:venta_id>/", views.api_venta_detalle, name="api_venta_detalle"),
    path("api/ventas/crear/", views.api_venta_crear, name="api_venta_crear"),
    path("api/ventas/cancelar/<int:venta_id>/", views.api_venta_cancelar, name="api_venta_cancelar"),
]
