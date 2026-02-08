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
    path('api/', views.api_usuarios_lista, name='api_lista'),
    path('api/crear/', views.api_usuario_crear, name='api_crear'),
    path('api/<int:usuario_id>/actualizar/', views.api_usuario_actualizar, name='api_actualizar'),
    path('api/<int:usuario_id>/eliminar/', views.api_usuario_eliminar, name='api_eliminar'),
]
