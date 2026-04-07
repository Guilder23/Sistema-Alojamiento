// Utilidades para modales de productos

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

function limpiarErrores() {
    document.querySelectorAll('.form-control.error').forEach(field => {
        field.classList.remove('error');
    });
    document.querySelectorAll('.form-error.active').forEach(error => {
        error.classList.remove('active');
    });
}
