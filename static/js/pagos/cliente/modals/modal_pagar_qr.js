/**
 * Modal Pagar con QR - JavaScript
 */

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
