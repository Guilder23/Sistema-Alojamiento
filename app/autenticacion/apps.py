from django.apps import AppConfig


class AutenticacionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app.autenticacion'
    verbose_name = 'Autenticación'

    def ready(self):
        from . import signals  # noqa: F401
