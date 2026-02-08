# Referencia de Modelos

## Estructura de Base de Datos

### Usuarios (`app/usuarios/`)

#### Modelo: `Rol`
Define los roles disponibles en el sistema.
```python
- nombre: CharField
- descripcion: TextField
- fecha_creacion: DateTimeField
```

**Roles preconfigurados:**
- administrador: Control total
- recepcionista: Gestión de reservas
- cliente: Acceso como cliente
- gerente: Gestión gerencial
- empleado_limpieza: Gestión de limpieza

#### Modelo: `PerfilUsuario`
Extender información del usuario Django.
```python
- usuario: OneToOneField(User)
- rol: ForeignKey(Rol)
- telefono: CharField
- direccion: TextField
- ciudad: CharField
- pais: CharField
- documento: CharField
- fecha_nacimiento: DateField
- foto_perfil: ImageField
- descripcion: TextField
- estado: CharField (activo/inactivo)
- fecha_creacion: DateTimeField
```

#### Modelo: `ActividadUsuario`
Auditoría de actividades.
```python
- usuario: ForeignKey(User)
- accion: CharField
- descripcion: TextField
- ip_address: CharField
- user_agent: TextField
- fecha: DateTimeField
```

---

### Habitaciones (`app/habitaciones/`)

#### Modelo: `Habitacion`
Gestión de habitaciones.
```python
- numero_habitacion: CharField (único)
- tipo_habitacion: CharField (simple/doble/suite/etc)
- capacidad: IntegerField
- precio_noche: DecimalField
- estado: CharField (disponible/ocupada/mantenimiento)
- descripcion: TextField
- amenidades: TextField
- piso: IntegerField
- vista: CharField
- fecha_creacion: DateTimeField
```

#### Modelo: `FotoHabitacion`
Fotos de habitaciones.
```python
- habitacion: ForeignKey(Habitacion)
- foto: ImageField
- descripcion: CharField
- es_principal: BooleanField
```

#### Modelo: `AmenidadHabitacion`
Amenidades disponibles.
```python
- nombre: CharField
- descripcion: TextField
```

---

### Clientes (`app/clientes/`)

#### Modelo: `Cliente`
Información de clientes.
```python
- usuario: ForeignKey(User)
- telefono: CharField
- direccion: TextField
- ciudad: CharField
- pais: CharField
- documento: CharField
- tipo_documento: CharField
- empresa: CharField
- cargo: CharField
- fecha_registro: DateTimeField
- ultima_visita: DateTimeField
- total_gastos: DecimalField
- numero_reservas: IntegerField
```

---

### Reservas (`app/reservas/`)

#### Modelo: `Reserva`
Sistema de reservas.
```python
- cliente: ForeignKey(Cliente)
- habitacion: ForeignKey(Habitacion)
- fecha_entrada: DateField
- fecha_salida: DateField
- numero_huespedes: IntegerField
- precio_total: DecimalField
- estado: CharField (pendiente/confirmada/cancelada)
- notas: TextField
- fecha_creacion: DateTimeField
```

#### Modelo: `HistorialReserva`
Auditoría de cambios.
```python
- reserva: ForeignKey(Reserva)
- estado_anterior: CharField
- estado_nuevo: CharField
- cambios: TextField
- usuario: ForeignKey(User)
- fecha: DateTimeField
```

---

### Pagos (`app/pagos/`)

#### Modelo: `Pago`
Gestión de transacciones.
```python
- reserva: ForeignKey(Reserva)
- monto: DecimalField
- metodo_pago: CharField
- referencia: CharField
- estado: CharField (pendiente/completado/fallido)
- fecha_pago: DateTimeField
- comprobante: FileField
```

#### Modelo: `MetodoPago`
Métodos de pago disponibles.
```python
- nombre: CharField
- descripcion: TextField
- activo: BooleanField
```

---

### Limpieza (`app/limpieza/`)

#### Modelo: `TareaLimpieza`
Tareas de limpieza.
```python
- habitacion: ForeignKey(Habitacion)
- tipo_limpieza: CharField
- asignado_a: ForeignKey(User)
- estado: CharField (pendiente/en_proceso/completada)
- fecha_programada: DateTimeField
- fecha_completada: DateTimeField
- notas: TextField
```

#### Modelo: `Mantenimiento`
Mantenimiento de habitaciones.
```python
- habitacion: ForeignKey(Habitacion)
- tipo_mantenimiento: CharField
- descripcion: TextField
- asignado_a: ForeignKey(User)
- estado: CharField
- fecha_inicio: DateTimeField
- fecha_fin: DateTimeField
```

#### Modelo: `BloqueoHabitacion`
Bloqueos de disponibilidad.
```python
- habitacion: ForeignKey(Habitacion)
- fecha_inicio: DateField
- fecha_fin: DateField
- razon: CharField
- creado_por: ForeignKey(User)
```

---

### Notificaciones (`app/notificaciones/`)

#### Modelo: `Notificacion`
Sistema de notificaciones.
```python
- usuario: ForeignKey(User)
- tipo: CharField
- titulo: CharField
- descripcion: TextField
- leida: BooleanField
- fecha_creacion: DateTimeField
```

#### Modelo: `ConfiguracionNotificacion`
Preferencias de notificación.
```python
- usuario: ForeignKey(User)
- email_reservas: BooleanField
- email_pagos: BooleanField
- email_mantenimiento: BooleanField
- email_promociones: BooleanField
```

#### Modelo: `HistorialEmail`
Registro de emails enviados.
```python
- destinatario: EmailField
- asunto: CharField
- cuerpo: TextField
- tipo: CharField
- estado: CharField (enviado/fallido)
- fecha_envio: DateTimeField
```

---

### Reportes (`app/reportes/`)

#### Modelo: `Estadistica`
Estadísticas generales.
```python
- fecha: DateField
- ocupacion: IntegerField
- ingresos: DecimalField
- reservas_nuevas: IntegerField
- clientes_nuevos: IntegerField
```

#### Modelo: `ReporteOcupacion`
Análisis de ocupación.
```python
- fecha: DateField
- habitaciones_ocupadas: IntegerField
- habitaciones_disponibles: IntegerField
- tasa_ocupacion: DecimalField
```

#### Modelo: `ReporteIngresos`
Análisis de ingresos.
```python
- fecha: DateField
- ingresos_habitaciones: DecimalField
- ingresos_servicios: DecimalField
- ingresos_extras: DecimalField
- total: DecimalField
```

#### Modelo: `ReporteClientesFrecuentes`
Análisis de clientes.
```python
- cliente: ForeignKey(Cliente)
- numero_reservas: IntegerField
- gasto_total: DecimalField
- ultima_visita: DateField
```

---

### Inicio (`app/inicio/`)

#### Modelo: `ConfiguracionSitio`
Configuración general del sitio.
```python
- nombre_hotel: CharField
- descripcion: TextField
- telefono: CharField
- email: EmailField
- direccion: TextField
- horario_atencion: CharField
- logo: ImageField
- favicon: ImageField
```

#### Modelo: `Servicio`
Servicios ofrecidos.
```python
- nombre: CharField
- descripcion: TextField
- icono: CharField
- precio: DecimalField (opcional)
- activo: BooleanField
```

#### Modelo: `Testimonio`
Testimonios de clientes.
```python
- cliente: ForeignKey(Cliente)
- titulo: CharField
- contenido: TextField
- calificacion: IntegerField (1-5)
- foto: ImageField
- aprobado: BooleanField
- fecha: DateTimeField
```

#### Modelo: `Galeria`
Galería de fotos.
```python
- titulo: CharField
- descripcion: TextField
- foto: ImageField
- categoria: CharField
- fecha_creacion: DateTimeField
```

#### Modelo: `Politica`
Políticas del sitio.
```python
- titulo: CharField
- contenido: TextField
- tipo: CharField
- fecha_creacion: DateTimeField
- fecha_actualizacion: DateTimeField
```

---

## Relaciones Principales

```
User (Django)
├── PerfilUsuario (1:1)
│   └── Rol
├── Cliente (1:1)
├── ActividadUsuario (1:N)
├── Notificacion (1:N)
├── ConfiguracionNotificacion (1:1)
└── TareaLimpieza (1:N)

Habitacion (1:N)
├── FotoHabitacion
├── Reserva
├── TareaLimpieza
├── Mantenimiento
└── BloqueoHabitacion

Reserva (1:N)
├── Pago
└── HistorialReserva

Cliente (1:N)
├── Reserva
├── Testimonio
└── ReporteClientesFrecuentes
```
