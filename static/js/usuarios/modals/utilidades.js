// Utilidades compartidas para los modales de usuarios

// Validar email
function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Mostrar error en campo específico
function mostrarErrorCampo(fieldId, mensaje) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('error');
        const errorDiv = field.parentElement.querySelector('.form-error');
        if (errorDiv) {
            errorDiv.textContent = mensaje;
            errorDiv.classList.add('active');
        }
    }
}

// Mostrar errores del servidor
function mostrarErroresFormulario(errors, prefix = 'crear') {
    for (const [field, messages] of Object.entries(errors)) {
        const fieldId = `${prefix}-${field}`;
        const mensaje = Array.isArray(messages) ? messages[0] : messages;
        mostrarErrorCampo(fieldId, mensaje);
    }
}

// Limpiar errores
function limpiarErrores() {
    document.querySelectorAll('.form-control.error').forEach(field => {
        field.classList.remove('error');
    });
    document.querySelectorAll('.form-error.active').forEach(error => {
        error.classList.remove('active');
    });
}

// Formatear fecha
function formatearFecha(fechaStr) {
    if (!fechaStr) return '-';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
