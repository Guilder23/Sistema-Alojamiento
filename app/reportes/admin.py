from django.contrib import admin
from .models import Estadistica, ReporteOcupacion, ReporteIngresos, ReporteClientesFrecuentes

@admin.register(Estadistica)
class EstadisticaAdmin(admin.ModelAdmin):
    list_display = ('periodo', 'fecha', 'total_reservas', 'ingresos_totales', 'porcentaje_ocupacion')
    list_filter = ('periodo', 'fecha')
    readonly_fields = ('creado',)

@admin.register(ReporteOcupacion)
class ReporteOcupacionAdmin(admin.ModelAdmin):
    list_display = ('habitacion', 'fecha', 'ocupada', 'cliente')
    list_filter = ('ocupada', 'fecha', 'habitacion')
    search_fields = ('habitacion__numero', 'cliente__nombre')

@admin.register(ReporteIngresos)
class ReporteIngresosAdmin(admin.ModelAdmin):
    list_display = ('periodo', 'fecha_inicio', 'fecha_fin', 'total_ingresos', 'ganancia_neta')
    list_filter = ('periodo', 'fecha_inicio')
    readonly_fields = ('creado',)

@admin.register(ReporteClientesFrecuentes)
class ReporteClientesFrecuentesAdmin(admin.ModelAdmin):
    list_display = ('cliente', 'total_reservas', 'total_noches', 'gasto_total')
    list_filter = ('total_reservas',)
    search_fields = ('cliente__nombre', 'cliente__apellido')
