// Modal Cancelar Venta

let ventaCancelar = null;

function cancelarVenta(ventaId) {
    ventaCancelar = ventasData.find(venta => venta.id === ventaId);
    if (!ventaCancelar) {
        alert('Venta no encontrada');
        return;
    }

    document.getElementById('cancelar-venta-id').textContent = ventaCancelar.id;
    abrirModal('modal-cancelar-venta');
}

document.getElementById('btn-confirmar-cancelar-venta')?.addEventListener('click', async function() {
    if (!ventaCancelar) return;

    try {
        const response = await fetch(`/productos/api/ventas/cancelar/${ventaCancelar.id}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Venta cancelada');
            cerrarModal('modal-cancelar-venta');
            ventaCancelar = null;
            cargarVentas();
        } else {
            alert(data.error || 'Error al cancelar venta');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cancelar venta');
    }
});

document.getElementById('close-modal-cancelar-venta')?.addEventListener('click', function() {
    cerrarModal('modal-cancelar-venta');
    ventaCancelar = null;
});

window.cancelarVenta = cancelarVenta;
