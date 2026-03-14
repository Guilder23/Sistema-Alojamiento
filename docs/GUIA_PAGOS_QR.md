# Sistema de Pagos QR - Guía Completa

## 📋 Descripción General

El sistema de pagos QR permite que los clientes paguen sus reservas escaneando un código QR proporcionado por el hotel, y que los recepcionistas validen estos pagos mediante comprobantes.

---

## 🔄 Flujo Completo del Sistema

### 1. **RECEPCIONISTA: Configurar QR** 

**Acceso:** Sidebar → "Configurar QR"

#### Pasos:
1. Hacer clic en **"Crear Nuevo QR"**
2. Llenar el formulario:
   - **Descripción**: Ej: "Transferencia a cuenta Banco XYZ - 123456789"
   - **Código/Datos del QR**: Número de cuenta, URL, o información de pago
   - **Subir Imagen QR** (Opcional): Si tienes un QR ya generado, súbelo aquí
   - **Estado**: Marcar como "Activo" para que los clientes lo vean

3. Guardar configuración

**Nota:** Solo puede haber un QR activo a la vez. Los clientes verán el QR activo al momento de pagar.

---

### 2. **CLIENTE: Hacer una Reserva**

**Acceso:** Habitaciones → Buscar → Reservar

#### Pasos:
1. El cliente busca una habitación disponible
2. Completa el formulario de reserva
3. Confirma la reserva

**Automático:** El sistema crea automáticamente un **Pago pendiente** vinculado a la reserva.

---

### 3. **CLIENTE: Ver Pagos Pendientes**

**Acceso:** Sidebar → "Mis Pagos" o desde "Mis Reservas" → "Ver Pagos"

#### Qué verá el cliente:
- Dashboard con resumen de pagos:
  - Total Pendiente
  - Total Validado
  - En Revisión
  - Rechazados
- Lista de todos sus pagos con estado

---

### 4. **CLIENTE: Pagar con QR**

**Acceso:** Mis Pagos → Botón "Pagar con QR"

#### Pasos:
1. Hacer clic en **"Pagar con QR"** en el pago pendiente
2. Se abre un modal mostrando:
   - **Información del Pago**: Reserva, Habitación, Monto
   - **Código QR**: Para escanear con app de banco
   - **Descripción**: Datos de la cuenta bancaria
   - **Instrucciones**: Pasos para completar el pago

3. El cliente escanea el QR con su app bancaria
4. Realiza la transferencia
5. Toma captura de pantalla del comprobante

---

### 5. **CLIENTE: Enviar Comprobante**

**Acceso:** Modal de QR → Botón "Enviar Comprobante"

#### Pasos:
1. Hacer clic en **"Enviar Comprobante"**
2. Seleccionar imagen del comprobante (max 5MB)
3. Vista previa del comprobante
4. Opcional: Agregar comentarios
5. Enviar

**Estado del pago cambia a:** "Comprobante Enviado" / "En Revisión"

---

### 6. **RECEPCIONISTA: Validar Pagos**

**Acceso:** Sidebar → "Validar Pagos"

#### Dashboard:
- **Tab "Por Validar"**: Pagos que tienen comprobante enviado
- **Tab "Validados"**: Pagos aprobados o rechazados

#### Pasos para validar:
1. Ver la tarjeta del pago pendiente
2. Hacer clic en **"Ver Comprobante"** para revisar la imagen
3. Verificar:
   - Monto correcto
   - Fecha de transferencia
   - Comprobante legible
   - Datos bancarios correctos

**Opciones:**

#### A) **Aprobar Pago**
1. Clic en "Aprobar"
2. Ingresar **Referencia de Transacción** (número de operación)
3. Opcional: Agregar comentarios
4. Confirmar

**Resultado:**
- Pago marcado como "Validado"
- Cliente puede descargar confirmación PDF
- Reserva cambia a estado "Confirmada"

#### B) **Rechazar Pago**
1. Clic en "Rechazar"
2. Seleccionar motivo:
   - Comprobante no legible
   - Monto no coincide
   - Comprobante no válido o falsificado
   - Otro (especificar)
3. Confirmar

**Resultado:**
- Pago vuelve a estado "Pendiente"
- Cliente ve el motivo de rechazo
- Cliente puede reintentar enviando nuevo comprobante

---

### 7. **CLIENTE: Descargar Confirmación**

**Acceso:** Mis Pagos → Pago validado → "Descargar PDF"

#### Qué incluye el PDF:
- **Información del Cliente**: Nombre, email, teléfono, documento
- **Información de la Reserva**: 
  - Habitación
  - Fechas (entrada/salida)
  - Número de huéspedes
  - Noches
- **Información del Pago**:
  - Estado de validación
  - Monto pagado
  - Validado por (recepcionista)
  - Fecha de validación
  - Referencia de transacción
- **Amenidades** de la habitación
- **Banner de confirmación**: "PAGO CONFIRMADO Y VALIDADO"

---

## 🗂️ Estados de los Pagos

| Estado | Descripción |
|--------|-------------|
| **Pendiente** | Pago creado, esperando que el cliente pague |
| **Comprobante Enviado** | Cliente envió comprobante, esperando validación |
| **Validado** | Recepcionista aprobó el pago |
| **Rechazado** | Recepcionista rechazó el comprobante |

---

## 🎯 Casos de Uso Especiales

### ✅ Cambiar QR Activo
**Recepcionista:**
1. Ir a "Configurar QR"
2. Hacer clic en "Activar" en el QR deseado
3. Los demás QR se desactivan automáticamente

### ✅ Editar Configuración QR
**Recepcionista:**
1. Ir a "Configurar QR"
2. Hacer clic en "Editar" en el QR deseado
3. Modificar datos
4. Opción: "Regenerar QR automáticamente" si cambió el código

### ✅ Cliente Reintenta Pago Rechazado
**Cliente:**
1. Ir a "Mis Pagos"
2. Ver pago rechazado con motivo
3. Hacer clic en "Reintentar Pago"
4. Enviar nuevo comprobante

---

## 📱 Interfaz Responsive

El sistema está completamente optimizado para:
- **Desktop**: Vista completa con todas las funcionalidades
- **Tablet**: Adaptación de tarjetas y layouts
- **Móvil**: Vista simplificada, botones apilados

---

## 🔐 Seguridad

- ✅ Autenticación requerida para todas las operaciones
- ✅ Validación de roles (Cliente vs Recepcionista)
- ✅ Protección CSRF en todos los formularios
- ✅ Validación de archivos (solo imágenes, max 5MB)
- ✅ Solo el cliente propietario puede ver sus pagos
- ✅ Solo recepcionistas pueden validar pagos

---

## 🛠️ Tecnologías Utilizadas

- **Backend**: Django 5.1.1
- **Frontend**: Bootstrap 5.1.3, Font Awesome 6.0.0
- **JavaScript**: Vanilla JS con Fetch API
- **Alertas**: SweetAlert2
- **QR Generation**: Python qrcode + PIL
- **Database**: SQLite (desarrollo)

---

## 📊 Reportes y Métricas

El dashboard de "Mis Pagos" muestra:
- Total de pagos pendientes
- Total de pagos validados
- Pagos en revisión
- Pagos rechazados

---

## 🚀 Próximas Mejoras

- [ ] Notificaciones email cuando se valida/rechaza pago
- [ ] Reportes de pagos para administrador
- [ ] Exportación de pagos a Excel
- [ ] Múltiples comprobantes por pago
- [ ] Integración con pasarelas de pago online

---

## 📞 Soporte

Para cualquier duda o problema con el sistema de pagos QR, contactar al administrador del sistema.

---

**Última actualización:** Febrero 2026
