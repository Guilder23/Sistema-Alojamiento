from django.urls import path
from . import views

app_name = 'habitaciones'

urlpatterns = [
    path('', views.HabitacionListView.as_view(), name='habitacion_list'),
    path('<int:pk>/', views.HabitacionDetailView.as_view(), name='habitacion_detail'),
    path('crear/', views.HabitacionCreateView.as_view(), name='habitacion_create'),
    path('<int:pk>/editar/', views.HabitacionUpdateView.as_view(), name='habitacion_update'),
    path('<int:pk>/eliminar/', views.HabitacionDeleteView.as_view(), name='habitacion_delete'),
]
