from django.urls import path
from . import views

app_name = 'inicio'

urlpatterns = [
    # Frontend público
    path('', views.InicioView.as_view(), name='inicio'),
]
