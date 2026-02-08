from django.urls import path
from . import views

app_name = 'notificaciones'

urlpatterns = [
    # Notificaciones - Será ampliado con vistas específicas
    # path('', views.NotificacionListView.as_view(), name='notificacion_list'),
    # path('<int:pk>/marcar-leida/', views.marcar_como_leida, name='marcar_leida'),
]
