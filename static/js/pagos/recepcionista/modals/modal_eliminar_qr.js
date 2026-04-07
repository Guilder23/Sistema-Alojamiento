/**
 * Modal Eliminar QR - Gestión de Eventos
 * Maneja la lógica de confirmación y eliminación de configuraciones QR
 */

let qrAEliminar = null;

/**
 * Abre el modal de eliminación
 * @param {number} qrId - ID del QR a eliminar
 */
function abrirModalEliminar(qrId) {
    qrAEliminar = qrId;
    const modal = new bootstrap.Modal(document.getElementById('modalEliminarQR'));
    modal.show();
}

/**
 * Confirma la eliminación del QR
 */
function confirmarEliminar() {
    if (!qrAEliminar) {
        console.error('No hay QR seleccionado para eliminar');
        return;
    }

    const btnConfirmar = document.getElementById('btnConfirmarEliminar');
    const textOriginal = btnConfirmar.innerHTML;
    
    // Deshabilitar botón y mostrar carga
    btnConfirmar.disabled = true;
    btnConfirmar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Eliminando...';

    // Hacer la petición AJAX
    fetch(`/pagos/configurar-qr/eliminar/${qrAEliminar}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalEliminarQR'));
            if (modal) {
                modal.hide();
            }

            // Recargar la página
            location.reload();
        } else {
            throw new Error(data.error || 'Error al eliminar');
        }
    })
    .catch(error => {
        console.error('Error al eliminar QR:', error);
        
        // Restaurar botón
        btnConfirmar.disabled = false;
        btnConfirmar.innerHTML = textOriginal;

        // Mostrar error
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Error al eliminar el QR',
            confirmButtonColor: '#dc3545'
        });
    });
}

/**
 * Obtiene el valor de una cookie
 * @param {string} name - Nombre de la cookie
 * @returns {string} Valor de la cookie
 */
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

/**
 * Inicializa los event listeners del modal
 */
function inicializarModalEliminar() {
    const btnConfirmar = document.getElementById('btnConfirmarEliminar');
    
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', confirmarEliminar);
    }

    // Limpiar cuando se cierre el modal
    const modal = document.getElementById('modalEliminarQR');
    if (modal) {
        modal.addEventListener('hidden.bs.modal', function () {
            qrAEliminar = null;
            const btn = document.getElementById('btnConfirmarEliminar');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-trash"></i> Sí, Eliminar';
            }
        });
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarModalEliminar);
} else {
    inicializarModalEliminar();
}
