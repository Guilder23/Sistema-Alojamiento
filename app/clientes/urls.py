from django.urls import path
from . import views

app_name = 'clientes'

urlpatterns = [
    # Clientes - Será ampliado con vistas específicas
    # path('', views.ClienteListView.as_view(), name='cliente_list'),
    # path('<int:pk>/', views.ClienteDetailView.as_view(), name='cliente_detail'),
]
