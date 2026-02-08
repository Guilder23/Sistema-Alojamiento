from django.urls import path
from django.contrib.auth import views as auth_views
from django.urls import reverse_lazy
from . import views

app_name = 'autenticacion'

urlpatterns = [
    # Autenticación
    path('login/', views.LoginPersonalizado.as_view(), name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('registro/', views.registro, name='registro'),
    
    # Cambio de contraseña
    path('cambiar-contraseña/', auth_views.PasswordChangeView.as_view(
        template_name='autenticacion/password_change.html',
        success_url=reverse_lazy('autenticacion:password_change_done')
    ), name='password_change'),
    path('cambiar-contraseña/completado/', auth_views.PasswordChangeDoneView.as_view(template_name='autenticacion/password_change_done.html'), name='password_change_done'),
    
    # Recuperación de contraseña
    path('recuperar-contraseña/', auth_views.PasswordResetView.as_view(
        template_name='autenticacion/password_reset.html',
        email_template_name='autenticacion/password_reset_email.txt',
        html_email_template_name='autenticacion/password_reset_email.html',
        success_url=reverse_lazy('autenticacion:password_reset_done')
    ), name='password_reset'),
    path('recuperar-contraseña/completado/', auth_views.PasswordResetDoneView.as_view(template_name='autenticacion/password_reset_done.html'), name='password_reset_done'),
    path('recuperar-contraseña/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(
        template_name='autenticacion/password_reset_confirm.html',
        success_url=reverse_lazy('autenticacion:password_reset_complete')
    ), name='password_reset_confirm'),
    path('recuperar-contraseña/confirmado/', auth_views.PasswordResetCompleteView.as_view(template_name='autenticacion/password_reset_complete.html'), name='password_reset_complete'),
    
    # Dashboards por rol
    path('dashboard/admin/', views.dashboard_admin, name='dashboard_admin'),
    path('dashboard/recepcionista/', views.dashboard_recepcionista, name='dashboard_recepcionista'),
    path('dashboard/gerente/', views.dashboard_gerente, name='dashboard_gerente'),
    path('dashboard/limpieza/', views.dashboard_limpieza, name='dashboard_limpieza'),
    path('dashboard/cliente/', views.dashboard_cliente, name='dashboard_cliente'),
    
    # Gestión de usuarios (panel administrativo)
    path('', views.usuarios_list, name='list'),
    path('api/usuarios/', views.usuarios_api, name='api_list'),
    path('api/crear/', views.crear_usuario, name='api_crear'),
    path('api/<int:usuario_id>/editar/', views.editar_usuario, name='api_editar'),
    path('api/<int:usuario_id>/eliminar/', views.eliminar_usuario, name='api_eliminar'),
]
