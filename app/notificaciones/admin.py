from django.contrib import admin
from .models import Notificacion, ConfiguracionNotificacion, HistorialEmail

@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'usuario', 'tipo', 'estado', 'creado')
    list_filter = ('estado', 'tipo', 'creado')
    search_fields = ('titulo', 'usuario__username', 'mensaje')
    readonly_fields = ('creado',)

@admin.register(ConfiguracionNotificacion)
class ConfiguracionNotificacionAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'recibir_por_email', 'hora_inicio_notificaciones')
    list_filter = ('recibir_por_email',)
    search_fields = ('usuario__username', 'usuario__email')

@admin.register(HistorialEmail)
class HistorialEmailAdmin(admin.ModelAdmin):
    list_display = ('destinatario', 'asunto', 'estado', 'creado')
    list_filter = ('estado', 'creado')
    search_fields = ('destinatario', 'asunto')
    readonly_fields = ('creado',)
