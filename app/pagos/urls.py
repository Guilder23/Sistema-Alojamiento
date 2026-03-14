from django.urls import path
from . import views

app_name = 'pagos'

urlpatterns = [
    # Pagos Cliente
    path('mis-pagos/', views.mis_pagos_view, name='mis_pagos'),
    path('ver-qr/<int:pago_id>/', views.ver_qr_pago_view, name='ver_qr'),
    path('enviar-comprobante/<int:pago_id>/', views.enviar_comprobante_view, name='enviar_comprobante'),
    path('descargar-pdf/<int:pago_id>/', views.descargar_pdf_confirmacion_view, name='descargar_pdf'),
    
    # Pagos Recepcionista - Validación
    path('validar/', views.validar_pagos_view, name='validar_pagos'),
    path('aprobar/<int:pago_id>/', views.aprobar_pago_view, name='aprobar_pago'),
    path('rechazar/<int:pago_id>/', views.rechazar_pago_view, name='rechazar_pago'),
    
    # Configuración QR - Recepcionista
    path('configurar-qr/', views.gestionar_qr_view, name='gestionar_qr'),
    path('configurar-qr/crear/', views.crear_qr_view, name='crear_qr'),
    path('configurar-qr/editar/<int:qr_id>/', views.editar_qr_view, name='editar_qr'),
    path('configurar-qr/activar/<int:qr_id>/', views.activar_qr_view, name='activar_qr'),
    path('configurar-qr/eliminar/<int:qr_id>/', views.eliminar_qr_view, name='eliminar_qr'),
    
    # API
    path('api/qr-config/', views.obtener_qr_config_view, name='api_qr_config'),
]
