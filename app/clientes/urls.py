from django.urls import path
from . import views

app_name = 'clientes'

urlpatterns = [
    path('', views.clientes_view, name='list'),
    path('api/lista/', views.api_clientes_lista, name='api_clientes_lista'),
    path('api/detalle/<int:cliente_id>/', views.api_cliente_detalle, name='api_cliente_detalle'),
    path('api/crear/', views.api_cliente_crear, name='api_cliente_crear'),
    path('api/actualizar/<int:cliente_id>/', views.api_cliente_actualizar, name='api_cliente_actualizar'),
    path('api/eliminar/<int:cliente_id>/', views.api_cliente_eliminar, name='api_cliente_eliminar'),
]
