from django.urls import path
from . import views

app_name = 'reservas'

urlpatterns = [
    # Vistas
    path('mis-reservas/', views.mis_reservas, name='mis_reservas'),
    path('todas/', views.todas_reservas, name='todas_reservas'),
    
    # API endpoints
    path('api/crear/', views.crear_reserva_api, name='crear_api'),
    path('api/detalle/<int:reserva_id>/', views.obtener_detalle_reserva_api, name='detalle_api'),
    path('api/confirmar/<int:reserva_id>/', views.confirmar_reserva_api, name='confirmar_api'),
    path('api/cancelar/<int:reserva_id>/', views.cancelar_reserva_api, name='cancelar_api'),
]
