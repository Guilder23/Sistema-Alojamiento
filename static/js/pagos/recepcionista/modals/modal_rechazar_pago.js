/**
 * Modal Rechazar Pago - JavaScript
 */

// Mostrar/ocultar textarea cuando se selecciona "Otro"
document.querySelectorAll('input[name="motivo"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const detalleContainer = document.getElementById('motivo-detalle-container');
        if (this.value === 'Otro') {
            detalleContainer.style.display = 'block';
        } else {
            detalleContainer.style.display = 'none';
        }
    });
});
