from django.urls import path
from . import views

app_name = 'limpieza'

urlpatterns = [
    # Limpieza y Mantenimiento - Será ampliado con vistas específicas
    # path('tareas/', views.TareaLimpiezaListView.as_view(), name='tarea_list'),
    # path('mantenimiento/', views.MantenimientoListView.as_view(), name='mantenimiento_list'),
]
