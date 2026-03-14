"""
URLs para la gestión de usuarios del sistema.
"""

from django.urls import path
from . import views

app_name = 'usuarios'

urlpatterns = [
    # Vistas principales
    path('', views.usuarios_view, name='list'),
    
    # API Endpoints
    path('api/lista/', views.api_usuarios_lista, name='api_usuarios_lista'),
    path('api/detalle/<int:usuario_id>/', views.api_usuario_detalle, name='api_usuario_detalle'),
    path('api/crear/', views.api_usuario_crear, name='api_usuario_crear'),
    path('api/actualizar/<int:usuario_id>/', views.api_usuario_actualizar, name='api_usuario_actualizar'),
    path('api/eliminar/<int:usuario_id>/', views.api_usuario_eliminar, name='api_usuario_eliminar'),
]
