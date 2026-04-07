from django.urls import path
from . import views

app_name = 'reservas'

urlpatterns = [
    # Vistas
    path('mis-reservas/', views.mis_reservas, name='mis_reservas'),
    path('todas/', views.todas_reservas, name='todas_reservas'),
    
    # API endpoints
    path('api/crear/', views.crear_reserva_api, name='crear_api'),
    path('api/habitaciones-disponibles/', views.api_habitaciones_disponibles, name='habitaciones_disponibles_api'),
    path('api/crear-presencial/', views.crear_reserva_presencial_api, name='crear_presencial_api'),
    path('api/detalle/<int:reserva_id>/', views.obtener_detalle_reserva_api, name='detalle_api'),
    path('api/confirmar/<int:reserva_id>/', views.confirmar_reserva_api, name='confirmar_api'),
    path('api/cancelar/<int:reserva_id>/', views.cancelar_reserva_api, name='cancelar_api'),
    path('api/checkin/<int:reserva_id>/', views.checkin_reserva_api, name='checkin_api'),
    path('api/checkout/<int:reserva_id>/', views.checkout_reserva_api, name='checkout_api'),
    path('api/pago-presencial/<int:reserva_id>/', views.registrar_pago_presencial_api, name='pago_presencial_api'),
]
