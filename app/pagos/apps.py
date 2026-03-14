from django.apps import AppConfig


class PagosConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app.pagos'
    
    def ready(self):
        """Importar signals cuando la app esté lista"""
        import app.pagos.signals
