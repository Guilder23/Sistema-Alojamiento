"""
URL configuration para Sistema de Alojamiento

Las URLs están organizadas por aplicación para mejor mantenibilidad.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Frontend público (raíz) - DEBE IR ANTES de las otras apps
    path('', include(('app.inicio.urls', 'inicio'), namespace='inicio')),
    
    # Aplicaciones del sistema
    path('autenticacion/', include(('app.autenticacion.urls', 'autenticacion'), namespace='autenticacion')),
    path('usuarios/', include(('app.usuarios.urls', 'usuarios'), namespace='usuarios')),
    path('habitaciones/', include('app.habitaciones.urls')),
    path('reservas/', include('app.reservas.urls')),
    path('clientes/', include('app.clientes.urls')),
    path('pagos/', include('app.pagos.urls')),
    path('limpieza/', include('app.limpieza.urls')),
    path('reportes/', include('app.reportes.urls')),
    path('notificaciones/', include('app.notificaciones.urls')),
]

# Configuración de archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
