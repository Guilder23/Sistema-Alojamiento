/**
 * Pagos Cliente - JavaScript
 * Gestión de pagos y QR para clientes
 */

let pagoActual = null;

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

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pagos Cliente inicializado');
    
    // Event listeners para botones de pagar con QR
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-pagar-qr')) {
            const btn = e.target.closest('.btn-pagar-qr');
            const pagoId = btn.getAttribute('data-pago-id');
            abrirModalPagarQR(parseInt(pagoId));
        }
        
        if (e.target.closest('.btn-reintentar-pago')) {
            const btn = e.target.closest('.btn-reintentar-pago');
            const pagoId = btn.getAttribute('data-pago-id');
            abrirModalPagarQR(parseInt(pagoId));
        }
    });
    
    // Botón siguiente comprobante
    const btnSiguiente = document.getElementById('btn-siguiente-comprobante');
    if (btnSiguiente) {
        btnSiguiente.addEventListener('click', abrirModalComprobante);
    }
    
    // Botón enviar comprobante
    const btnEnviar = document.getElementById('btn-enviar-comprobante');
    if (btnEnviar) {
        btnEnviar.addEventListener('click', enviarComprobante);
    }
    
    // Input de comprobante
    const inputComprobante = document.getElementById('comprobante-input');
    if (inputComprobante) {
        inputComprobante.addEventListener('change', previewComprobante);
    }
});

/**
 * Abrir modal para pagar con QR
 */
function abrirModalPagarQR(pagoId) {
    pagoActual = pagoId;
    
    const fila = document.querySelector(`[data-pago-id="${pagoId}"]`);
    if (!fila) return;
    
    // Obtener datos de la fila
    const reservaText = fila.querySelector('strong').textContent;
    const habitacionText = fila.querySelectorAll('small')[0].textContent;
    const montoText = fila.querySelectorAll('td')[1].textContent.trim();
    
    // Llenar información en el modal
    document.getElementById('info-reserva').textContent = reservaText;
    document.getElementById('info-habitacion').textContent = habitacionText;
    document.getElementById('info-monto').textContent = montoText;
    
    // Cargar QR
    cargarQR();
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalPagarQR'));
    modal.show();
}

/**
 * Cargar QR desde API
 */
async function cargarQR() {
    const wrapper = document.getElementById('qr-image-wrapper');
    const descripcion = document.getElementById('qr-descripcion');
    
    try {
        const response = await fetch('/pagos/api/qr-config/');
        
        if (!response.ok) {
            wrapper.innerHTML = '<p class="text-danger">No hay QR configurado</p>';
            return;
        }
        
        const data = await response.json();
        
        if (data.imagen_qr) {
            wrapper.innerHTML = `<img src="${data.imagen_qr}" alt="QR de Pago">`;
        } else {
            wrapper.innerHTML = '<p class="text-danger">No hay QR disponible</p>';
        }
        
        if (data.descripcion) {
            descripcion.textContent = data.descripcion;
        }
    } catch (error) {
        console.error('Error al cargar QR:', error);
        wrapper.innerHTML = '<p class="text-danger">Error al cargar el QR</p>';
    }
}

/**
 * Abrir modal de comprobante
 */
function abrirModalComprobante() {
    // Cerrar modal anterior
    const modalQR = bootstrap.Modal.getInstance(document.getElementById('modalPagarQR'));
    if (modalQR) {
        modalQR.hide();
    }
    
    // Abrir modal de comprobante
    const modal = new bootstrap.Modal(document.getElementById('modalComprobante'));
    modal.show();
}

/**
 * Preview de la imagen del comprobante
 */
function previewComprobante(event) {
    const file = event.target.files[0];
    
    if (!file) {
        document.getElementById('preview-container').style.display = 'none';
        document.getElementById('btn-enviar-comprobante').disabled = true;
        return;
    }
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        event.target.value = '';
        return;
    }
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar 5MB');
        event.target.value = '';
        return;
    }
    
    // Mostrar preview
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('preview-image').src = e.target.result;
        document.getElementById('preview-container').style.display = 'block';
        document.getElementById('btn-enviar-comprobante').disabled = false;
    };
    reader.readAsDataURL(file);
}

/**
 * Enviar comprobante de pago
 */
async function enviarComprobante() {
    if (!pagoActual) {
        alert('Error: No se pudo identificar el pago');
        return;
    }
    
    const fileInput = document.getElementById('comprobante-input');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Por favor selecciona un comprobante');
        return;
    }
    
    const btn = document.getElementById('btn-enviar-comprobante');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';
    
    const formData = new FormData();
    formData.append('comprobante', file);
    
    try {
        const response = await fetch(`/pagos/enviar-comprobante/${pagoActual}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Mostrar mensaje de éxito
            Swal.fire({
                icon: 'success',
                title: '¡Comprobante Enviado!',
                text: data.message,
                confirmButtonColor: '#3b82f6'
            }).then(() => {
                // Recargar página
                location.reload();
            });
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'No se pudo enviar el comprobante'
        });
        
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check"></i> Enviar Comprobante';
    }
}

/**
 * Descargar PDF
 */
function descargarPDF(pagoId) {
    window.location.href = `/pagos/descargar-pdf/${pagoId}/`;
}
