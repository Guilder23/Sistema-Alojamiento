from django.shortcuts import render, redirect
from django.views.generic import TemplateView
from django.contrib.auth.mixins import UserPassesTestMixin

# Create your views here.

class InicioView(TemplateView):
    """Vista de inicio - Redirecciona si está logueado al dashboard apropiado"""
    template_name = 'inicio/inicio.html'
    
    def get(self, request, *args, **kwargs):
        # Si está logueado, redirigir al dashboard apropiado según su rol
        if request.user.is_authenticated:
            try:
                rol = request.user.perfil.rol.nombre
            except:
                rol = 'cliente'
            
            # Redirigir según el rol
            if rol == 'administrador':
                return redirect('autenticacion:dashboard_admin')
            elif rol == 'recepcionista':
                return redirect('autenticacion:dashboard_recepcionista')
            elif rol == 'gerente':
                return redirect('autenticacion:dashboard_gerente')
            elif rol == 'empleado':
                return redirect('autenticacion:dashboard_limpieza')
            else:
                return redirect('autenticacion:dashboard_cliente')
        
        # Si no está logueado, mostrar la página de inicio pública
        return super().get(request, *args, **kwargs)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo'] = 'Bienvenido al Sistema de Alojamiento'
        return context
