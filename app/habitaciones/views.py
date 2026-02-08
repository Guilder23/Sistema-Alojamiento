from django.shortcuts import render
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy
from .models import Habitacion


class HabitacionListView(LoginRequiredMixin, ListView):
    """Lista todas las habitaciones"""
    model = Habitacion
    template_name = 'habitaciones/habitacion_list.html'
    context_object_name = 'habitaciones'
    paginate_by = 10
    
    def get_queryset(self):
        return Habitacion.objects.all().order_by('numero')


class HabitacionDetailView(LoginRequiredMixin, DetailView):
    """Detalle de una habitación"""
    model = Habitacion
    template_name = 'habitaciones/habitacion_detail.html'
    context_object_name = 'habitacion'


class HabitacionCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    """Crear nueva habitación"""
    model = Habitacion
    template_name = 'habitaciones/habitacion_form.html'
    fields = ['numero', 'tipo', 'capacidad', 'precio_noche', 'estado', 'piso', 'descripcion', 'foto']
    success_url = reverse_lazy('habitaciones:habitacion_list')
    
    def test_func(self):
        """Solo administradores pueden crear habitaciones"""
        return self.request.user.is_staff


class HabitacionUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    """Editar habitación"""
    model = Habitacion
    template_name = 'habitaciones/habitacion_form.html'
    fields = ['numero', 'tipo', 'capacidad', 'precio_noche', 'estado', 'piso', 'descripcion', 'foto']
    success_url = reverse_lazy('habitaciones:habitacion_list')
    
    def test_func(self):
        """Solo administradores pueden editar habitaciones"""
        return self.request.user.is_staff


class HabitacionDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    """Eliminar habitación"""
    model = Habitacion
    template_name = 'habitaciones/habitacion_confirm_delete.html'
    success_url = reverse_lazy('habitaciones:habitacion_list')
    
    def test_func(self):
        """Solo administradores pueden eliminar habitaciones"""
        return self.request.user.is_staff
