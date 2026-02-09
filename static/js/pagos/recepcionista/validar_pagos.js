/**
 * Pagos Recepcionista - JavaScript
 * Validación de pagos de clientes
 */

// Obtener CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

let pagoActual = null;

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Validar Pagos inicializado');
    
    // Event listeners para botones de aprobar/rechazar
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-aprobar-pago')) {
            const btn = e.target.closest('.btn-aprobar-pago');
            pagoActual = btn.getAttribute('data-pago-id');
            document.getElementById('pago-id-aprobar').value = pagoActual;
        }
        
        if (e.target.closest('.btn-rechazar-pago')) {
            const btn = e.target.closest('.btn-rechazar-pago');
            pagoActual = btn.getAttribute('data-pago-id');
            document.getElementById('pago-id-rechazar').value = pagoActual;
            // Limpiar formulario
            document.getElementById('form-rechazar-pago').reset();
        }
    });
    
    // Botón confirmar aprobación
    const btnConfirmarAprobacion = document.getElementById('btn-confirmar-aprobacion');
    if (btnConfirmarAprobacion) {
        btnConfirmarAprobacion.addEventListener('click', aprobarPago);
    }
    
    // Botón confirmar rechazo
    const btnConfirmarRechazo = document.getElementById('btn-confirmar-rechazo');
    if (btnConfirmarRechazo) {
        btnConfirmarRechazo.addEventListener('click', rechazarPago);
    }
});

/**
 * Aprobar un pago
 */
async function aprobarPago() {
    const form = document.getElementById('form-aprobar-pago');
    const pagoId = document.getElementById('pago-id-aprobar').value;
    
    if (!pagoId) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo identificar el pago'
        });
        return;
    }
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const referencia = document.getElementById('referencia-transaccion').value;
    const comentario = document.getElementById('comentario-aprobacion').value;
    
    const btn = document.getElementById('btn-confirmar-aprobacion');
    const btnOriginalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';
    
    try {
        const response = await fetch(`/pagos/aprobar/${pagoId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrftoken
            },
            body: new URLSearchParams({
                'referencia': referencia,
                'comentario': comentario
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalAprobarPago'));
            if (modal) modal.hide();
            
            // Mostrar mensaje de éxito
            Swal.fire({
                icon: 'success',
                title: '¡Pago Aprobado!',
                text: data.message,
                confirmButtonColor: '#059669',
                timer: 2000,
                timerProgressBar: true
            }).then(() => {
                location.reload();
            });
        } else {
            throw new Error(data.error || 'Error al aprobar el pago');
        }
    } catch (error) {
        console.error('Error:', error);
        btn.disabled = false;
        btn.innerHTML = btnOriginalHTML;
        
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'No se pudo aprobar el pago',
            confirmButtonColor: '#dc3545'
        });
    }
}

/**
 * Rechazar un pago
 */
async function rechazarPago() {
    const form = document.getElementById('form-rechazar-pago');
    const pagoId = document.getElementById('pago-id-rechazar').value;
    
    if (!pagoId) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo identificar el pago'
        });
        return;
    }
    
    const motivoRadio = document.querySelector('input[name="motivo"]:checked');
    if (!motivoRadio) {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'Por favor selecciona un motivo de rechazo'
        });
        return;
    }
    
    let motivo = motivoRadio.value;
    
    // Si es "Otro", usar el texto del textarea
    if (motivo === 'Otro') {
        const detalle = document.getElementById('motivo-detalle').value.trim();
        if (!detalle) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Por favor especifica el motivo del rechazo'
            });
            return;
        }
        motivo = detalle;
    }
    
    const btn = document.getElementById('btn-confirmar-rechazo');
    const btnOriginalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';
    
    try {
        const response = await fetch(`/pagos/rechazar/${pagoId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrftoken
            },
            body: new URLSearchParams({
                'motivo': motivo
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalRechazarPago'));
            if (modal) modal.hide();
            
            // Mostrar mensaje de confirmación
            Swal.fire({
                icon: 'warning',
                title: 'Pago Rechazado',
                text: data.message,
                confirmButtonColor: '#d97706',
                timer: 2000,
                timerProgressBar: true
            }).then(() => {
                location.reload();
            });
        } else {
            throw new Error(data.error || 'Error al rechazar el pago');
        }
    } catch (error) {
        console.error('Error:', error);
        btn.disabled = false;
        btn.innerHTML = btnOriginalHTML;
        
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'No se pudo rechazar el pago',
            confirmButtonColor: '#dc3545'
        });
    }
}
