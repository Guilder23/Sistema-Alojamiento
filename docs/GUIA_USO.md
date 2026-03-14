# 🔧 Guía de Uso y Comandos

## Comandos Django Esenciales

### Gestión de Base de Datos

```bash
# Crear migraciones después de cambios en models.py
python manage.py makemigrations

# Aplicar migraciones a la BD
python manage.py migrate

# Ver estado de migraciones
python manage.py showmigrations

# Revertir última migración
python manage.py migrate <app> <numero_migracion>

# Revertir todas las migraciones de una app
python manage.py migrate <app> zero
```

### Usuarios y Superusuario

```bash
# Crear superusuario (admin)
python manage.py createsuperuser

# Cambiar contraseña de usuario
python manage.py changepassword <username>

# Crear usuario desde shell
python manage.py shell
```

### Django Shell

```bash
# Acceder al shell interactivo
python manage.py shell

# Dentro del shell:
from django.contrib.auth.models import User
from app.usuarios.models import Rol

# Crear usuario
user = User.objects.create_user(
    username='nuevo_usuario',
    email='usuario@example.com',
    password='contraseña123'
)

# Crear rol
rol = Rol.objects.create(
    nombre='cliente',
    descripcion='Cliente del hotel'
)

# Asignar rol a usuario
from app.usuarios.models import PerfilUsuario
perfil = PerfilUsuario.objects.get(usuario=user)
perfil.rol = rol
perfil.save()

exit()
```

### Servidor y Testing

```bash
# Iniciar servidor de desarrollo
python manage.py runserver

# Iniciar en puerto específico
python manage.py runserver 0.0.0.0:8080

# Ejecutar tests
python manage.py test

# Tests de una app específica
python manage.py test app.usuarios

# Tests con verbosidad
python manage.py test --verbosity=2

# Tests con cobertura
coverage run --source='.' manage.py test
coverage report
```

### Archivos Estáticos

```bash
# Recolectar archivos estáticos
python manage.py collectstatic

# Limpiar archivos estáticos
python manage.py clearstaticstorage

# Buscar archivos estáticos
python manage.py findstatic <nombre_archivo>
```

### Verificación

```bash
# Verificar configuración
python manage.py check

# Ver todas las URLs disponibles
python manage.py show_urls

# Validar modelos
python manage.py check <app>
```

---

## Roles de Usuario Preconfigurados

### 1️⃣ Administrador
**Acceso**: Panel de administración completo  
**Permisos**: Crear, editar, eliminar cualquier objeto  
**Crear administrativamente**:
```python
user = User.objects.create_superuser(
    username='admin',
    email='admin@hotel.com',
    password='admin123'
)
```

### 2️⃣ Gerente
**Acceso**: Reportes, configuración general  
**Permisos**: Ver estadísticas, aprobar cambios  
```python
perfil.rol = Rol.objects.get(nombre='gerente')
```

### 3️⃣ Recepcionista
**Acceso**: Gestión de reservas y pagos  
**Permisos**: Crear/editar reservas, procesar pagos  
```python
perfil.rol = Rol.objects.get(nombre='recepcionista')
```

### 4️⃣ Cliente
**Acceso**: Portal de cliente  
**Permisos**: Ver disponibilidad, hacer reservas  
```python
perfil.rol = Rol.objects.get(nombre='cliente')
```

### 5️⃣ Empleado de Limpieza
**Acceso**: Tareas de limpieza  
**Permisos**: Ver y marcar tareas completadas  
```python
perfil.rol = Rol.objects.get(nombre='empleado_limpieza')
```

---

## Setup Inicial Rápido

### Paso 1: Clonar y Configurar
```bash
cd C:\Users\GUILDER\Desktop\PTRABAJO\SistemaAlojamiento
python -m venv venv
source venv/Scripts/activate  # Windows
pip install -r requirements.txt
```

### Paso 2: Base de Datos
```bash
python manage.py migrate
python manage.py createsuperuser

# Usuario admin:
# username: admin
# email: admin@hotel.com
# password: admin123
```

### Paso 3: Crear Roles
```bash
python manage.py shell
```

Ejecutar en shell Python:
```python
from app.usuarios.models import Rol

roles = [
    {'nombre': 'administrador', 'descripcion': 'Control total del sistema'},
    {'nombre': 'gerente', 'descripcion': 'Gestión gerencial del hotel'},
    {'nombre': 'recepcionista', 'descripcion': 'Gestión de reservas y pagos'},
    {'nombre': 'cliente', 'descripcion': 'Acceso como cliente del hotel'},
    {'nombre': 'empleado_limpieza', 'descripcion': 'Gestión de limpieza'},
]

for rol_data in roles:
    Rol.objects.get_or_create(**rol_data)

print("✅ Roles creados correctamente")
exit()
```

### Paso 4: Crear Datos de Prueba

Usuarios de prueba disponibles:
- admin / admin123
- usuario_1 / pass123
- usuario_2 / pass123
- ... (hasta usuario_10)

### Paso 5: Iniciar Servidor
```bash
python manage.py runserver
```

**Acceder a**:
- Home: http://localhost:8000/
- Admin: http://localhost:8000/admin/
- Login: http://localhost:8000/usuarios/login/

---

## Troubleshooting Común

### Error: "Port 8000 already in use"
```bash
# Usar puerto diferente
python manage.py runserver 8001

# Matar proceso en Windows (si es necesario)
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Error: "ModuleNotFoundError"
```bash
# Reinstalar dependencias
pip install -r requirements.txt --force-reinstall
```

### Error: "No such table"
```bash
# Ejecutar migraciones
python manage.py migrate

# Si aún falla, resetear BD completamente
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

### Error: "TemplateDoesNotExist"
```bash
# Verificar que TEMPLATES está bien configurado en settings.py
# Asegurarse que templates/ existe en la raíz del proyecto
python manage.py collectstatic
```

---

## Variables de Entorno Importantes

Crear archivo `.env` en la raíz:

```env
# Django
DEBUG=True
SECRET_KEY=tu-clave-secreta-aqui
ALLOWED_HOSTS=127.0.0.1,localhost

# Email (Gmail)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=tu-email@gmail.com
EMAIL_HOST_PASSWORD=tu-contraseña-app

# Database
DATABASE_NAME=db.sqlite3

# Timezone
TIME_ZONE=America/Argentina/Buenos_Aires
```

Para usar variables de entorno, instalar:
```bash
pip install python-dotenv
```

Y en `settings.py`:
```python
import os
from dotenv import load_dotenv

load_dotenv()

DEBUG = os.getenv('DEBUG', True)
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
```

---

## Checklist de Despliegue a Producción

- ☐ Cambiar DEBUG a False
- ☐ Actualizar ALLOWED_HOSTS
- ☐ Cambiar SECRET_KEY
- ☐ Usar base de datos PostgreSQL/MySQL
- ☐ Configurar HTTPS
- ☐ Configurar email SMTP real
- ☐ Ejecutar `collectstatic`
- ☐ Configurar CORS si hay APIs
- ☐ Revisar CSRF_TRUSTED_ORIGINS
- ☐ Hacer backup de base de datos
- ☐ Configurar backups automáticos
- ☐ Activar logging en producción
- ☐ Configurar monitoreo de errores
