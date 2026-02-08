from django.urls import path
from . import views

app_name = 'habitaciones'

urlpatterns = [
    path('', views.habitaciones_view, name='list'),

    path('api/lista/', views.api_habitaciones_lista, name='api_habitaciones_lista'),
    path('api/detalle/<int:habitacion_id>/', views.api_habitacion_detalle, name='api_habitacion_detalle'),
    path('api/crear/', views.api_habitacion_crear, name='api_habitacion_crear'),
    path('api/actualizar/<int:habitacion_id>/', views.api_habitacion_actualizar, name='api_habitacion_actualizar'),
    path('api/eliminar/<int:habitacion_id>/', views.api_habitacion_eliminar, name='api_habitacion_eliminar'),
]
