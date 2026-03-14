# 🏗️ Arquitectura del Sistema

## Diagrama de Capas

```
┌─────────────────────────────────────────────┐
│         CAPA DE PRESENTACIÓN                 │
│  Templates HTML + CSS + JavaScript           │
│  - base.html                                 │
│  - componentes (navbar, sidebar, footer)     │
│  - templates por aplicación                  │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│      CAPA DE LÓGICA DE NEGOCIO               │
│  Views + Forms + Utils                       │
│  - app/usuarios/views.py                     │
│  - app/habitaciones/views.py                 │
│  - app/reservas/views.py                     │
│  - etc.                                      │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│      CAPA DE ACCESO A DATOS                  │
│  Models + Managers + QuerySets               │
│  - app/*/models.py                           │
│  - Validaciones de negocio                   │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│        CAPA DE PERSISTENCIA                  │
│  Database (SQLite)                           │
│  - db.sqlite3                                │
└─────────────────────────────────────────────┘
```

---

## Estructura de Aplicaciones Django

### Patrones de Carpetas

```
app/<nombre_aplicacion>/
├── migrations/           # Cambios de base de datos
├── templates/           # Plantillas HTML (opcional si usan templates/)
├── __init__.py
├── admin.py             # Configuración del admin
├── apps.py              # Config de la app
├── models.py            # Modelos de base de datos
├── views.py             # Vistas (lógica)
├── urls.py              # URLs específicas
├── forms.py             # Formularios (si aplica)
├── utils.py             # Funciones de utilidad
└── tests.py             # Tests unitarios
```

---

## Flujo de Autenticación

```
Usuario Anónimo
    ↓
GET /login/
    ↓
Mostrar formulario login
    ↓
POST con credenciales
    ↓
Validar (usuarios.views.LoginView)
    ↓
¿Credenciales OK?
├─ SI  → Crear sesión → Redirigir a /inicio/
└─ NO  → Mostrar error → Volver a /login/
    ↓
Usuario Autenticado
```

---

## Flujo de Reservas

```
Cliente
    ↓
Buscar habitaciones disponibles
    ↓
GET /habitaciones/
    ↓
Seleccionar habitación + fechas
    ↓
Crear reserva
    ↓
POST /reservas/crear/
    ↓
Validar disponibilidad (reservas.models)
    ↓
¿Disponible?
├─ SI  → Crear reserva → Ir a pago
└─ NO  → Mostrar error → Volver a búsqueda
    ↓
Sistema de Pago
    ↓
Procesar pago (pagos.views)
    ↓
Confirmar reserva
    ↓
Enviar email confirmation (notificaciones)
    ↓
Reserva confirmada
```

---

## Flujo de Limpieza

```
Reserva Confirmada
    ↓
fecha_salida < hoy
    ↓
Señalar habitación como "por limpiar"
    ↓
Crear TareaLimpieza
    ↓
Asignar a personal de limpieza
    ↓
Personal recibe notificación
    ↓
Ejecutar limpieza
    ↓
Marcar tarea como completada
    ↓
Actualizar estado habitación a "disponible"
```

---

## Sistema de Roles y Permisos

```
ADMINISTRADOR
├── Acceso total al sistema
├── Crear/editar/eliminar usuarios
├── Configuración del sitio
└── Reportes avanzados

GERENTE
├── Ver reportes
├── Aprobar/cancelar reservas
├── Gestionar personal
└── Configuración básica

RECEPCIONISTA
├── Crear reservas
├── Procesar pagos
├── Check-in/Check-out
└── Responder consultas

CLIENTE
├── Ver disponibilidad
├── Hacer reservas
├── Pagar online
└── Ver historial de reservas

EMPLEADO_LIMPIEZA
├── Ver tareas de limpieza
├── Marcar completadas
└── Reportar mantenimiento
```

---

## Configuración de URLs

```
ROOT: sistema_alojamiento/urls.py

RootURLConfig
├── /admin/ → Django Admin
│   └── (usuarios.admin)
│
├── usuarios/ → app/usuarios/urls.py (NAMESPACE: 'usuarios')
│   ├── login/ → LoginView
│   ├── logout/ → LogoutView
│   ├── register/ → RegisterView
│   ├── profile/ → ProfileView
│   └── password_reset/ → PasswordResetView
│
├── habitaciones/ → app/habitaciones/urls.py (NAMESPACE: 'habitaciones')
│   ├── / → HabitacionListView
│   └── <id>/ → HabitacionDetailView
│
├── reservas/ → app/reservas/urls.py (NAMESPACE: 'reservas')
│   ├── crear/ → ReservaCreateView
│   └── mis-reservas/ → ReservaListView
│
├── pagos/ → app/pagos/urls.py (NAMESPACE: 'pagos')
│   └── procesar/ → PagoProcessView
│
└── / → app/inicio/urls.py (NAMESPACE: 'inicio')
    ├── / → InicioView
    └── servicios/ → ServiciosView
```

---

## Configuración de Email

```
Provider: Gmail SMTP
Host: smtp.gmail.com
Port: 587
Protocol: TLS

Emails configurados para:
├── Confirmación de registro
├── Recuperación de contraseña
├── Cambio de contraseña
├── Confirmación de reserva
├── Recordatorios
└── Notificaciones del sistema
```

---

## Ambiente de Desarrollo vs Producción

### Desarrollo
```
DEBUG = True
DATABASE = SQLite (db.sqlite3)
ALLOWED_HOSTS = ['127.0.0.1', 'localhost']
EMAIL = Console output
STATIC_FILES = Servir automáticamente
```

### Producción
```
DEBUG = False
DATABASE = PostgreSQL/MySQL
ALLOWED_HOSTS = Dominios configurados
EMAIL = SMTP real
STATIC_FILES = Servir desde CDN/Servidor
HTTPS = Obligatorio
```

---

## Seguridad Implementada

- Protección CSRF (tokens)
- Prevención de SQL Injection (ORM Django)
- Protección XSS (Template escaping)
- Autenticación y Autorización (Roles)
- Encriptación de Contraseña (PBKDF2)
- Gestión de Sesiones (Django sessions)
- Verificación de Email (Tokens)
- Auditoría de Actividades (ActividadUsuario)
