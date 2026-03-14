from django.urls import path
from . import views

app_name = 'habitaciones'

urlpatterns = [
    path('', views.habitaciones_view, name='list'),
    path('mapa/', views.mapa_habitaciones_view, name='mapa'),
    path('buscar/', views.buscar_habitaciones_view, name='buscar'),

    # APIs para administradores
    path('api/lista/', views.api_habitaciones_lista, name='api_habitaciones_lista'),
    path('api/detalle/<int:habitacion_id>/', views.api_habitacion_detalle, name='api_habitacion_detalle'),
    path('api/crear/', views.api_habitacion_crear, name='api_habitacion_crear'),
    path('api/actualizar/<int:habitacion_id>/', views.api_habitacion_actualizar, name='api_habitacion_actualizar'),
    path('api/eliminar/<int:habitacion_id>/', views.api_habitacion_eliminar, name='api_habitacion_eliminar'),
    
    # API pública para clientes
    path('api/detalle-publico/<int:habitacion_id>/', views.api_habitacion_detalle_publico, name='api_habitacion_detalle_publico'),
]
