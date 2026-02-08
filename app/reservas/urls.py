from django.urls import path
from . import views

app_name = 'reservas'

urlpatterns = [
    # Reservas - Será ampliado con vistas específicas
    # path('', views.ReservaListView.as_view(), name='reserva_list'),
    # path('<int:pk>/', views.ReservaDetailView.as_view(), name='reserva_detail'),
    # path('crear/', views.ReservaCreateView.as_view(), name='reserva_create'),
    # path('<int:pk>/editar/', views.ReservaUpdateView.as_view(), name='reserva_update'),
    # path('<int:pk>/cancelar/', views.ReservaCancelView.as_view(), name='reserva_cancel'),
]
