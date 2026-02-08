from django.urls import path
from . import views

app_name = 'pagos'

urlpatterns = [
    # Pagos - Será ampliado con vistas específicas
    # path('', views.PagoListView.as_view(), name='pago_list'),
    # path('<int:pk>/', views.PagoDetailView.as_view(), name='pago_detail'),
    # path('<int:pk>/crear/', views.PagoCreateView.as_view(), name='pago_create'),
]
